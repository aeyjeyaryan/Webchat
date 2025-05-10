from pydantic import BaseModel, HttpUrl

class URLRequest(BaseModel):
    url: HttpUrl

class QueryRequest(BaseModel):
    url: HttpUrl
    query: str