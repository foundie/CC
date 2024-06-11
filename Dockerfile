# Menggunakan base image Python Alpine
FROM python:3.10-slim

# Set working directory di dalam container
WORKDIR /app

# Menyalin file-file yang diperlukan
COPY . .

# Install dependencies
RUN pip install -r requirements.txt

# Menjalankan aplikasi Flask
CMD ["python3", "-m", "predicts/main/face-class"]