# Menggunakan image Node.js versi 20
FROM node:20

# Menetapkan direktori kerja di dalam container
WORKDIR /usr/src/app

# Menetapkan variabel lingkungan untuk PORT
ENV PORT 3003

# Menyalin file package.json dan package-lock.json ke dalam container
COPY package*.json ./

# Menyalin file kredensial Google Cloud ke dalam container
COPY google-credentials.json /usr/src/app/google-credentials.json

# Menjalankan npm install untuk menginstal dependensi
RUN npm install

# Menyalin seluruh proyek ke dalam container
COPY . .

# Menetapkan variabel lingkungan untuk kredensial Google Cloud
ENV GOOGLE_APPLICATION_CREDENTIALS="/usr/src/app/google-credentials.json"

# Mengekspos port yang digunakan oleh aplikasi
EXPOSE 3003

# Menjalankan aplikasi
CMD ["npm", "start"]
