import { NextResponse } from 'next/server';
import { PASS_SERVER_URL, PASS_API_KEY } from '@/lib/config';

function onlyDigits(v: string) {
  return (v || '').replace(/\D+/g, '');
}

export async function POST(request: Request) {
  try {
    if (!PASS_API_KEY) {
      return NextResponse.json({ error: '서버 환경변수 PASS_API_KEY가 필요합니다.' }, { status: 500 });
    }
    const { task_id, name, birthday, phone, captcha_answer } = await request.json();
    if (!task_id || !name || !birthday || !phone || !captcha_answer) {
      return NextResponse.json({ error: 'task_id, name, birthday(7), phone, captcha_answer 필수' }, { status: 400 });
    }

    const birth7 = onlyDigits(birthday);
    if (birth7.length !== 7) {
      return NextResponse.json({ error: '생년월일은 YYMMDD+성별코드 7자리여야 합니다.' }, { status: 400 });
    }
    const phoneDigits = onlyDigits(phone);
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      return NextResponse.json({ error: '전화번호는 숫자 10~11자리여야 합니다.' }, { status: 400 });
    }

    const res = await fetch(`${PASS_SERVER_URL}/api/info-submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: PASS_API_KEY,
        task_id,
        name,
        birthday: birth7,
        phone: phoneDigits,
        captcha_answer
      })
    });
    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error('PASS info-submit 프록시 오류:', e);
    return NextResponse.json({ error: 'PASS info-submit 호출 실패' }, { status: 500 });
  }
}


