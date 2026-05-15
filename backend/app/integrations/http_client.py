import httpx

http_client = httpx.AsyncClient(
    http2=False,
    limits=httpx.Limits(
        max_connections=50,
        max_keepalive_connections=10,
        keepalive_expiry=60.0      # keep Squad connections warm longer
    ),
    timeout=httpx.Timeout(
        connect=15.0,               # was 10s — extra buffer for flaky networks
        read=30.0,
        write=30.0,
        pool=30.0
    ),
    transport=httpx.AsyncHTTPTransport(retries=2),  # retry on ConnectTimeout
    follow_redirects=True
)