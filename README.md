## API

### Register

#### User Register

- URL : /register
- Method : POST
- Request Body:
  - name as string
  - email as string
  - password as string
- Response :

```json
{
  "status": "ok",
  "message": "register successfuly"
}
```

#### User Login

- URL : /auth/login
- Method : POST
- Request Body:
  - email as string
  - password as string
- Response:

```json
{
  "status": "ok",
  "message": "logged in successfully",
  "user": {
    "name": "name",
    "email": "email@email.com",
    "role": "role",
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiam9obiIsImVtYWlsIjoiam9obmRvZUBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImN1c3RvbWVyX2lkIjozLCJpYXQiOjE3MDA2MzQxNDR9.sgoDeu8lNRm_SfoXbb7MkpMEn4ghG0g4Le0GFyN2bn8"
}
```

#### User Gmmail Login

- URL : /auth/google
- Method : GET
- Response:

```json
{
  "status": "ok",
  "message": "logged in successfully",
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MTU5NDAzMzYsImV4cCI6MTcxNjE5OTUzNn0.d9nLQ_-hSiclGgxyNOjA8Pdj2s-kaufUbJkWmG6wtQE",
    "user": {
        "email": "sanseath2@gmail.com",
        "picture": "https://lh3.googleusercontent.com/a/ACg8ocKlEsb0QnkCTzeH3I-cUkpefThUTPeL8UTr6OxgIFXMmx3lbw=s96-c"
    }
}
}
```

## Create Product

- **URL** : `/products`
- **Method** : `POST`
- **Request Header**:
  - `Content-Type` : `multipart/form-data`
- **Request Body** :
  - `name` as `string` - Nama produk
  - `description` as `string` - Deskripsi produk
  - `price` as `number` - Harga produk
  - `category` as `string` - Kategori produk
  - `imageFile` as `file` - File gambar produk

- **Response** :

  ```json
  {
    "status": "success",
    "message": "Product successfully created",
    "documentName": "abc123",
    "data": {
      "id": "abc123",
      "name": "Lipstick",
      "description": "A long-lasting lipstick",
      "price": 19.99,
      "category": "Makeup",
      "imageUrl": "https://storage.googleapis.com/your-bucket/makeup_products/1234567890_lipstick.jpg"
    }
  }
