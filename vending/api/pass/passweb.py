from fastapi import FastAPI, HTTPException, Request, Response, Depends, Form
from fastapi.responses import JSONResponse, RedirectResponse, FileResponse
from starlette.middleware.sessions import SessionMiddleware
from verification import PASS_NICE
import time, os, jwt
from datetime import datetime, timedelta
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
from pydantic import BaseModel
from typing import Optional, Dict, Any

app = FastAPI()
app.add_middleware(
    SessionMiddleware,
    secret_key=os.urandom(24),
    session_cookie="session"
)

openSession = {}

api_key = "pass123456789!"

class InitRequest(BaseModel):
    api_key: str

class IspSubmitRequest(BaseModel):
    api_key: str
    task_id: str
    isp: str

class InfoSubmitRequest(BaseModel):
    api_key: str
    name: str
    birthday: str
    phone: str
    captcha_answer: str
    task_id: str

class VerifyRequest(BaseModel):
    api_key: str
    auth_code: str
    task_id: str

class GetCaptchaRequest(BaseModel):
    img: str

class ApiResponse(BaseModel):
    status: str
    message: str
    data: Optional[Dict[str, Any]] = None
    task_id: Optional[str] = None

async def get_session_data(task_id: str):
    if task_id and task_id in openSession:
        return openSession[task_id]
    return None

@app.post('/api/init', response_model=ApiResponse)
async def init_verification(request: InitRequest):
    if request.api_key != api_key:
        return JSONResponse(
            status_code=401,
            content={'status': 'error', 'message': 'API 키가 올바르지 않습니다'}
        )
    
    task_id = os.urandom(25).hex()
    openSession[task_id] = {
        'time': time.time(),
    }
    
    return {
        'status': 'success',
        'message': '인증 세션이 초기화되었습니다',
        'data': {},
        'task_id': task_id
    }

@app.post('/api/isp-submit', response_model=ApiResponse)
async def isp_submit(request: IspSubmitRequest):
    if not all([request.api_key, request.isp, request.task_id]):
        return JSONResponse(
            status_code=400, 
            content={'status': 'error', 'message': '필수 파라미터가 누락되었습니다', 'task_id': request.task_id}
        )
    
    if request.api_key != api_key:
        return JSONResponse(
            status_code=401,
            content={'status': 'error', 'message': 'API 키가 올바르지 않습니다'}
        )
    
    try:
        verification = PASS_NICE(request.isp)
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={'status': 'error', 'message': '올바른 ISP를 입력해주세요.', 'task_id': request.task_id}
        )

    if request.task_id not in openSession:
        openSession[request.task_id] = {}
        
    openSession[request.task_id].update({
        'verification': verification,
        'time': time.time(),
        'isp': request.isp
    })
    
    init_result = await verification.initSession()
    if not init_result['Success']:
        return JSONResponse(
            status_code=500, 
            content={'status': 'error', 'message': init_result['Message'], 'task_id': request.task_id}
        )

    captcha_result = await verification.getCaptcha()
    if not captcha_result['Success']:
        return JSONResponse(
            status_code=500,
            content={'status': 'error', 'message': captcha_result['Message'], 'task_id': request.task_id}
        )
        
    try:
        os.makedirs("./static/cap/", exist_ok=True)
        filename = f"{os.urandom(25).hex()}.png"
        with open(f"./static/cap/{filename}", 'wb') as f:
            f.write(captcha_result['Content'])
    except Exception:
        return JSONResponse(
            status_code=500,
            content={'status': 'error', 'message': "캡챠 이미지를 저장하던 중 오류가 발생하였습니다.", 'task_id': request.task_id}
        )
    
    return {
        'status': 'success',
        'message': '캡챠 이미지가 생성되었습니다',
        'data': {
            'captcha': f"https://pass.bcpulse.net/api/img?img={filename}"
        },
        'task_id': request.task_id
    }

@app.post('/api/info-submit', response_model=ApiResponse)
async def info_submit(request: InfoSubmitRequest):
    if request.api_key != api_key:
        return JSONResponse(
            status_code=401,
            content={'status': 'error', 'message': 'API 키가 올바르지 않습니다'}
        )
    
    session_data = await get_session_data(request.task_id)
    if not session_data:
        return JSONResponse(
            status_code=400, 
            content={'status': 'error', 'message': '유효하지 않은 task_id입니다', 'task_id': request.task_id}
        )
    
    if not all([request.name, request.birthday, request.phone, request.captcha_answer]):
        return JSONResponse(
            status_code=400,
            content={'status': 'error', 'message': '필수 파라미터가 누락되었습니다', 'task_id': request.task_id}
        )
        
    session_data["name"] = request.name
    session_data["birth"] = request.birthday
    session_data["phone"] = request.phone
    
    verification = session_data['verification']
    send_result = await verification.sendSMS(
        request.name, request.birthday, request.phone, request.captcha_answer
    )
    
    if not send_result['Success']:
        return JSONResponse(
            status_code=500,
            content={"status": 'error', "message": send_result['Message'], 'task_id': request.task_id}
        )

    return {
        'status': 'success',
        'message': '인증번호가 발송되었습니다',
        'data': {},
        'task_id': request.task_id
    }

@app.post('/api/verify', response_model=ApiResponse)
async def verify_code(request: VerifyRequest):
    if request.api_key != api_key:
        return JSONResponse(
            status_code=401,
            content={'status': 'error', 'message': 'API 키가 올바르지 않습니다'}
        )
    
    session_data = await get_session_data(request.task_id)
    if not session_data:
        return JSONResponse(
            status_code=400,
            content={'status': 'error', 'message': '유효하지 않은 task_id입니다', 'task_id': request.task_id}
        )

    verification = session_data['verification']
    check_result = await verification.checkSMS(request.auth_code)
    
    if not check_result['Success']:
        return JSONResponse(
            status_code=500,
            content={"status": 'error', "message": check_result['Message'], 'task_id': request.task_id}
        )

    if request.task_id in openSession:
        del openSession[request.task_id]
    
    return {
        'status': 'success',
        'message': '인증이 완료되었습니다',
        'data': {
            'name': session_data['name'],
            'birth': session_data['birth'],
            'phone': session_data['phone'],
            'isp': session_data['isp']
        },
        'task_id': request.task_id
    }

@app.get('/api/img')
async def get_captcha(img: str):
    if '..' in img or '/' in img:
        return JSONResponse(
            status_code=400,
            content={'status': 'error', 'message': '잘못된 이미지 경로입니다'}
        )
    
    file_path = f"./static/cap/{img}"
    
    if not os.path.exists(file_path):
        return JSONResponse(
            status_code=404,
            content={'status': 'error', 'message': '이미지를 찾을 수 없습니다'}
        )
    
    return FileResponse(file_path)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=1212)
