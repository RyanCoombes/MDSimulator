FROM python:3.12-slim
WORKDIR /srv
RUN pip install --no-cache-dir "anthropic>=2.14,<3"
COPY app/ app/
COPY server.py .
EXPOSE 8080
CMD ["python3", "server.py", "--port", "8080"]
