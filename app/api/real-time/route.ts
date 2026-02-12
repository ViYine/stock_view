import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '0'
    
    // 一次性加载所有数据，page参数用于获取更多数据
    const index = parseInt(page) * 60
    
    const apiUrl = new URL('https://apphq.longhuvip.com/w1/api/index.php')
    const params = {
      Order: '1',
      a: 'RealRankingInfo_W8',
      st: '60',
      c: 'NewStockRanking',
      PhoneOSNew: '1',
      DeviceID: '20ad85ca-becb-3bed-b3d4-30032a0f5923',
      VerSion: '5.22.0.2',
      index: index.toString(),
      apiv: 'w29',
      Type: '1',
      FilterMotherboard: '0',
      Filter: '0',
      Ratio: '6',
      FilterTIB: '0',
      FilterGem: '0',
    }
    
    // 将参数转换为 URL 编码的 form 数据
    const formData = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value)
    })
    
    const response = await fetch(apiUrl.toString(), {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 14; V2178A Build/UP1A.231005.007)",
      },
      body: formData.toString(),
    })
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `HTTP ${response.status}: ${response.statusText}` },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    
    if (data.errcode !== '0') {
      return NextResponse.json(
        { error: `API 错误: ${data.errcode}` },
        { status: 400 }
      )
    }
    
    return NextResponse.json(data)
  } catch (err) {
    console.error('API 代理错误:', err)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
