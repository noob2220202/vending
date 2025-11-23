from flask import Flask, render_template, request, session, redirect, abort, jsonify, send_file,  send_from_directory, url_for, flash
import json,websockets,sqlite3,base64,logging
import re,asyncio,requests

app = Flask("Pulse AOS Auto Charge")
app.config['TEMPLATES_AUTO_RELOAD'] = True

SERVER_URL = 'http://localhost:3000'

def getip():
        return request.headers.get("CF-Connecting-IP", request.remote_addr)

@app.route("/bank", methods=["POST"])
async def _bank():
    ip = getip()
    obj = request.get_json()
    stime = obj.get("time")
    pushbullet = obj.get("pushbullet")
    amount = obj.get("amount")
    name = obj.get("name")
    user_id = obj.get("userId")
    charge_log_id = obj.get("chargeLogId")
    print(f"IP: {ip}, Time: {stime}, Pushbullet: {pushbullet}, Amount: {amount}, Name: {name}, UserId: {user_id}, ChargeLogId: {charge_log_id}")

    if not all([amount, name]):
        return jsonify({"success": False, "message": "인자가 부족합니다."}), 400
    
    if not pushbullet:
        print(f"충전 요청 등록: {name} - {amount}원 (푸시불렛 토큰 없음)")
        return jsonify({"success": True, "message": "충전 요청이 등록되었습니다. 수동 처리가 필요합니다."}), 200
    
    try:
        if len(pushbullet) != 34:
            return jsonify({"success": False, "message": "잘못된 푸시불렛 토큰 입니다."}), 400
    except:
        return jsonify({"success": False, "message": "잘못된 푸시불렛 토큰 입니다."}), 400


    async def check_payment_with_websocket(pushbullet, amount, name, stime):
        MAX_RETRIES = 8  # 최대 재시도 횟수
        
        for attempt in range(MAX_RETRIES):
            try:
                async with asyncio.timeout(1200):
                    async with websockets.connect(
                        f"wss://stream.pushbullet.com/websocket/{pushbullet}", 
                        ping_interval=30, 
                        ping_timeout=30
                    ) as websocket:
                        print(f"WebSocket connection established (Attempt {attempt + 1}/{MAX_RETRIES}).")
                        
                        while websocket.open:
                            message = await websocket.recv()
                            data = json.loads(message)
                            
                            if data.get("type") == 'push':
                                push = data["push"]
                                package_name = str(push.get("package_name", ""))
                                title = str(push.get("title", ""))
                                body = str(push.get("body", ""))
                                print('title', title)
                                print('body', body)
                                bamount, bname = extract(package_name, title, body)
                                print(f"Received Push: Amount: {bamount}, Name: {bname}")
                                
                                if int(amount) == int(bamount) and name.strip() == bname.strip():
                                    print("Payment confirmed!")
                                    # 성공 시 DB 처리 및 반환
                                    conn = sqlite3.connect("chargelist.db")
                                    cursor = conn.cursor()

                                    # 최근 60초 이내 같은 이름 + 금액이 있는지 확인
                                    cursor.execute("""
                                        SELECT 1 FROM chargelist 
                                        WHERE amount = ? AND name = ? AND ABS(time - ?) < 60
                                        LIMIT 1
                                    """, (amount, name.strip(), stime))
                                    exists = cursor.fetchone()

                                    if exists:
                                        print("중복 충전 시도 감지 -> 거부")
                                        conn.close()
                                        return {'success': False, 'message': '중복 충전'}

                                    try:
                                        cursor.execute(
                                            "INSERT INTO chargelist (time, amount, name, device, comfirmed) VALUES (?, ?, ?, ?, ?)",
                                            (stime, amount, name.strip(), "aos", 1)
                                        )
                                        conn.commit()
                                    except sqlite3.IntegrityError:
                                        print("다계정 충전 취약점 제한 성공")
                                        conn.close()
                                        return {'success': False, 'message': '다계정 충전 제한'}

                                    conn.close()
                                    return {'success': True, 'amount': amount}
                                else:
                                    print('amount', amount, 'bamount', bamount, 'name', name, 'bname', bname)

    
            except websockets.exceptions.ConnectionClosed as e:
                print(f"WebSocket connection closed unexpectedly. Retrying... ({e})")
                if attempt < MAX_RETRIES - 1:
                    await asyncio.sleep(5)
                    continue
                else:
                    print("Max retries exceeded. Exiting loop.")
                    return {'success': False, 'message': '최대 재시도 횟수 초과'}
    
            except asyncio.TimeoutError:
                print("Timeout: Payment not confirmed within the time limit.")
                return {'success': False, 'message': '시간 초과'}
    
            except websockets.exceptions.InvalidURI:
                print("Invalid WebSocket URI.")
                return {'success': False, 'message': '잘못된 WebSocket URI'}
            
            except Exception as e:
                import traceback
                print("Error:", traceback.format_exc())
                if attempt < MAX_RETRIES - 1:
                    await asyncio.sleep(10)
                    continue
                return {'success': False, 'message': f'오류: {str(e)}'}
            return {'success': False, 'message': '알 수 없는 오류'}
    
    result = await check_payment_with_websocket(pushbullet, amount, name, stime)
    
    if user_id and charge_log_id:
        try:
            callback_data = {
                'userId': user_id,
                'chargeLogId': charge_log_id,
                'amount': int(amount),
                'success': result.get('success', False)
            }
            
            callback_response = requests.post(
                f"{SERVER_URL}/api/charge/callback",
                json=callback_data,
                timeout=10
            )
            
            if callback_response.status_code == 200:
                print(f"Next.js 콜백 성공: {user_id} - {amount}원")
            else:
                print(f"Next.js 콜백 실패: {callback_response.status_code} - {callback_response.text}")
        except Exception as callback_error:
            print(f"Next.js 콜백 오류: {callback_error}")
    
    if result.get('success'):
        return jsonify({"success": True, "message": "입금이 확인되었습니다.", "amount": int(amount)}), 200
    else:
        return jsonify({"success": False, "message": result.get('message', '입금 확인에 실패했습니다.')}), 400



def extract(package_name: str, title: str, body: str):
    amount, name = 0, ""
    
    if package_name == "com.IBK.SmartPush.app":
        parts = body.split(" ")
        name = parts[2]
        amount = int(parts[1].replace("원", "").replace(",", "")) if parts[1].replace("원", "").replace(",", "").isdigit() else 0
    elif package_name == "com.kbstar.kbbank":
        amount = title.split(' ')[1].replace(",", "").replace("원", "")
        amount = int(amount) if amount.isdigit() else 0
        name = body.split(' ')[4]
    elif package_name == "NH올원뱅크":
        start_index = body.find("입금") + 2
        end_index = body.find("원", start_index)
        amount_str = body[start_index:end_index].strip().replace(",", "")
        amount = int(amount_str) if amount_str.isdigit() else 0
        name = body.split("\n")[-1].split()[-2]
    elif package_name in ["com.nh.mobilenoti", "nh.smart.banking", "nh.smart.nhcok"]:
        parts = body.split(" ")
        name = parts[5]
        amount = int(parts[1].replace("입금", "").replace("원", "").replace(",", "")) if parts[1].replace("입금", "").replace("원", "").replace(",", "").isdigit() else 0
    elif package_name == "com.wooribank.smart.npib":
        parts = body.split(" ")
        name = parts[2]
        raw_amount = parts[3].replace("원", "").replace(",", "")
        amount = int(raw_amount) if raw_amount.isdigit() else 0
    elif package_name == "com.kakaobank.channel":
        parts = body.split(" ")
        name = parts[0]
        amount = int(title.split(' ')[1].replace(",", "").replace("원", "")) if title.split(' ')[1].replace(",", "").replace("원", "").isdigit() else 0
    elif package_name == "com.kebhana.hanapush":
        match = re.search(r"입금\s([\d,]+)원\n([가-힣]+)\n잔액", body)
        if match:
            amount = int(match.group(1).replace(",", ""))
            name = match.group(2)
        else:
            amount = 0
            name = ""
    elif package_name == "com.kbstar.starpush":
        parts = body.split(" ")
        name = parts[3]
        amount = int(parts[5].replace(',', '')) if parts[5].replace(',', '').isdigit() else 0
    elif package_name == "com.kbankwith.smartbank":
        lines = body.split("\n")
        amount_str = lines[0].replace("입금 ", "").replace("원", "").replace(",", "")
        amount = int(amount_str) if amount_str.isdigit() else 0
        name = lines[1].split("|")[0].strip()
    elif package_name == "com.shinhan.sbanking":
        parts = body.split(" ")
        name = parts[1]
        amount = int(parts[0].replace(',', '').replace('원', '')) if parts[0].replace(',', '').replace('원', '').isdigit() else 0
    elif package_name == "viva.republica.toss":
        if "입금" in title:
            # 금액 추출
            amount_str = title.replace("원 입금", "").replace(",", "")
            amount = int(amount_str) if amount_str.isdigit() else 0
            # 이름 추출
            name = body.split(" ")[0]
    elif package_name == "com.smg.mgnoti":
        parts = body.split(" ")
        amount = int(parts[1].replace(',', '').replace('원', '')) if parts[1].replace(',', '').replace('원', '').isdigit() else 0
        name = parts[-1]
    elif package_name == "com.kbstar.reboot":
        parts = body.split(' ')
        amount = int(parts[1].replace(',', '')[:-2]) if parts[1].replace(',', '')[:-2].isdigit() else 0
        name = parts[0][:-2]
    else:
        print("pass")
        pass

    return amount, name



if __name__ == "__main__":
    import logging
    logging.basicConfig(level=logging.DEBUG)
    app.run(host="0.0.0.0",port=2009)
