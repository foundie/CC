# API Documentation

## Register

### User Register
- **URL** : `/register`
- **Method** : `POST`
- **Request Header**:
  - `Content-Type` : `multipart/form-data`
- **Request Body** :
  - `nama` as `string` -` Nama`
  - `email` as `string` - `Email`
  - `password` as `string` - `Password`
  - `usia` as `number` - `Kategori produk`
  - `image` as `file` - `File Foto Profile`
- **Response** :

```json
{
  "status": "ok",
  "message": "register successfuly"
}
```
### User Login

- **URL** : `/auth/login`
- **Method** : `POST`
- **Request** Body:
  - `email` as `string`
  - `password` as `string`
- **Response**:

```json
{
  "status": "ok",
  "message": "logged in successfully",
  "user": {
    "name": "name",
    "email": "email@email.com",
    "role": "role",
    "age": "usia",
    "profileImageUrl": "https://storage.googleapis.com/storage-foundie/user/sansb746%40gmail.com/profilePicture?GoogleAccessId=firebase-adminsdk-571q2%40capstone-project-foundie.iam.gserviceaccount.com&Expires=16446992400&Signature=Q76l9SIoL71Es0TfkYPCuqNmGSCLfeuMs%2BRXqiqobufKx5b8ClmKrIPRdrlhNetNfVqL0Jx9fyZbN911vVCoELP%2Bg2K5%2BIRluD7fcJglLAdW7pKrlWvi2BysMLPxs%2F86mOawVIFUKg0XtdHSUOPWtQPhutgH9A3iUCrzzagZuUOM4P%2FHkhKfJ3KzRSjO1%2B2tAbh4jkB8r%2BGcObu9KHf%2FkIKB9lYn8NuE2s6wRf%2BZW2igV7VSIUxPPxqikXqwrxx18fKYuRuzRBqV52nndhOar752i7LudfmShqz%2FTw1NGgDOK%2FHwuS1j51rvuL1sI3nZGpFPAnLum4bUGiSWmbwA6g%3D%3D",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiam9obiIsImVtYWlsIjoiam9obmRvZUBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImN1c3RvbWVyX2lkIjozLCJpYXQiOjE3MDA2MzQxNDR9.sgoDeu8lNRm_SfoXbb7MkpMEn4ghG0g4Le0GFyN2bn8"
  }
  
}
```

### User Gmail Login

- **URL** : `/auth/google`
- **Method** : `GET`
- **Response**:

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
## Products

### Add Product

- **URL** : `/products/add`
- **Method** : `POST`
- **Request Header**:
  - `Content-Type` : `multipart/form-data`
- **Request Body** :
  - `name` as `string` - `Nama produk`
  - `description` as `string` - `Deskripsi produk`
  - `price` as `number` - `Harga produk`
  - `category` as `string` - `Kategori produk`
  - `image` as `file` - `File gambar produk`

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
      "price": 10000,
      "category": "Makeup",
      "imageUrl": "https://storage.googleapis.com/your-bucket/makeup_products/1234567890_lipstick.jpg"
    }
  }

## Community
### Add Post

- **URL** : `/community/post`
- **Method** : `POST`
- **Auth required** : `YES`
- **Permissions required** : `None`
- **Request Header**:
  - `Content-Type` : `multipart/form-data`
- **Request Body** :
  - `title` as `string` - `Judul post`
  - `text` as `string` - `Teks post`
  - `imageFile` as `file` - `File gambar post`

- **Response** :

```json
{
  "status": "ok",
  "message": "Post successfully created",
  "data": {
    "postId": "id post",
    "email": "email pengguna",
    "title": "judul post",
    "text": "teks post",
    "imageUrl": "url gambar post",
    "timestamp": "timestamp server"
  }
}
```
### Delete Post

- **URL** : `/community/:postId`
- **Method** : `DELETE`
- **Auth required** : `YES`
- **Request Header**:
  - `Content-Type` : `application/json`
- **URL Parameters** :
  - `postId` as `string` - `ID dari postingan yang akan dihapus`
- **Response** :

```json
{
  "status": "ok",
  "message": "Post and related data successfully deleted"
}
```

### Get Post Data

- **URL** : `/community/:postId`
- **Method** : `GET`
- **Auth required** : `YES`
- **Permissions required** : `None`
- **URL Parameters** :
  - `postId` as `string` - `ID dari post`

- **Response** :
```json
{
  "status": "ok",
  "message": "Post data successfully retrieved",
  "data": {
    "post": {
      "postId": "id post",
      "email": "email pengguna",
      "title": "judul post",
      "text": "teks post",
      "imageUrl": "url gambar post",
      "timestamp": "timestamp server"
    },
    "comments": [
      {
        "commentId": "id komentar",
        "postId": "id post",
        "email": "email pengguna",
        "text": "teks komentar",
        "timestamp": "timestamp server",
        "replies": [
          {
            "replyId": "id balasan",
            "commentId": "id komentar",
            "email": "email pengguna",
            "text": "teks balasan",
            "timestamp": "timestamp server"
          },
        ]
      },
    ],
    "likes": [
      {
        "likeId": "id suka",
        "postId": "id post",
        "email": "email pengguna",
        "timestamp": "timestamp server"
      },
    ]
  }
}
```
### Add Comment

- **URL** : `/community/comment/:postId`
- **Method** : `POST`
- **Auth required** : `YES`
- **Permissions required** : `None`
- **URL Parameters** :
  - `postId` as `string` - `ID dari post`
- **Request Body** :
  - `text` as `string` - `Teks komentar`

- **Response** :

```json
{
  "status": "ok",
  "message": "Comment successfully created",
  "data": {
    "commentId": "id komentar",
    "email": "email pengguna",
    "postId": "id post",
    "text": "teks komentar",
    "timestamp": "timestamp server"
  }
}

```
### Delete Comment

- **URL** : `/community/comment/:commentId`
- **Method** : `DELETE`
- **Auth required** : `YES`
- **Request Header**:
  - `Content-Type` : `application/json`
- **URL Parameters** :
  - `commentId` as `string` - `ID dari komentar yang akan dihapus`
- **Response** :

```json
{
  "status": "ok",
  "message": "Comment and related replies successfully deleted"
}
```

### Add Reply

- **URL** : `/community/reply/:commentId`
- **Method** : `POST`
- **Auth required** : `YES`
- **Permissions required** : `None`
- **URL Parameters** :
  - `commentId` as `string` - `ID dari komentar`
- **Request Body** :
  - `text` as `string` - `Teks balasan`

- **Response** :

```json
{
  "status": "ok",
  "message": "Reply successfully created",
  "data": {
    "replyId": "id balasan",
    "email": "email pengguna",
    "commentId": "id komentar",
    "text": "teks balasan",
    "timestamp": "timestamp server"
  }
}
```
### Delete Comment

- **URL** : `/community/reply/:replyId`
- **Method** : `DELETE`
- **Auth required** : `YES`
- **Request Header**:
  - `Content-Type` : `application/json`
- **URL Parameters** :
  - `replyId` as `string` - `ID dari reply yang akan dihapus`
- **Response** :

```json
{
  "status": "ok",
  "message": "Reply successfully deleted"
}
```

### Add Like

- **URL** : `/community/like/:postId`
- **Method** : `POST`
- **Auth required** : `YES`
- **Permissions required** : `None`
- **URL Parameters** :
  - `postId` as `string` - `ID dari post`

- **Response** :

```json
{
  "status": "ok",
  "message": "Like successfully created",
  "likeId": "id suka",
  "data": {
    "email": "email pengguna",
    "postId": "id post",
    "timestamp": "timestamp server"
  }
}
```
### Delete Like

- **URL** : `/community/like/:likeId`
- **Method** : `DELETE`
- **Auth required** : `YES`
- **Request Header**:
  - `Content-Type` : `application/json`
- **URL Parameters** :
  - `LikeId` as `string` - `ID dari Like yang akan dihapus`
- **Response** :

```json
{
  "status": "ok",
  "message": "Like successfully deleted"
}
```
