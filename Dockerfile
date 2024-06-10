# Menggunakan base image Python Alpine
FROM python:3.10-slim

# Set working directory di dalam container
WORKDIR /app

# Menyalin file-file yang diperlukan
COPY . .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port yang digunakan oleh aplikasi Flask
EXPOSE 8080

# Menjalankan aplikasi Flask
CMD ["python", "-m", "predicts.main.face-class"]