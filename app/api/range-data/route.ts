import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '0'
    const startTime = searchParams.get('startTime')
    const endTime = searchParams.get('endTime')
    
    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: '缺少 startTime 或 endTime 参数' },
        { status: 400 }
      )
    }
    
    const index = parseInt(page) * 60
    
    const apiUrl = new URL('https://apphq.longhuvip.com/w1/api/index.php')
    const params = {
      Order: '1',
      a: 'RealRankingInfo_W8',
      st: '60',
      c: 'NewStockRanking',
      PhoneOSNew: '1',
      DeviceID: '20ad85ca-becb-3bed-b3d4-30032a0f5923',
      VerSion: '5.8.0.2',
      index: index.toString(),
      apiv: 'w29',
      Type: '1',
      FilterMotherboard: '0',
      Filter: '0',
      Ratio: '6',
      FilterTIB: '0',
      FilterGem: '0',
      RStart: startTime,
      REnd: endTime,
    }
    
    Object.entries(params).forEach(([key, value]) => {
      apiUrl.searchParams.append(key, value)
    })
    
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
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