# Backend for Foundie
> Capstone Project ENTS-H120

**Development backend link : https://foundie-backend-dev-b3pq7ueuta-uc.a.run.app/**
**Backend Link 2 : https://foundie-backend-hapijs-dev-b3pq7ueuta-uc.a.run.app**

# API Documentation

## Register

### User Register
- **URL** : `/register`
- **Method** : `POST`
- **Request Body** :
  - `name` as `string` -` Nama`
  - `email` as `string` - `Email`
  - `password` as `string` - `Password`
- **Response** :

```json
{
  "status": 201,
  "message": "register successfuly",
  "error": false
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
  "status": 200,
  "message": "logged in successfully",
  "user": {
    "name": "name",
    "email": "email@email.com",
    "role": "role",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiam9obiIsImVtYWlsIjoiam9obmRvZUBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImN1c3RvbWVyX2lkIjozLCJpYXQiOjE3MDA2MzQxNDR9.sgoDeu8lNRm_SfoXbb7MkpMEn4ghG0g4Le0GFyN2bn8"
  }
  "error": false
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
  "error": false
}
```

### Update Biodata
- **URL** : `/biodata/add`
- **Method** : `POST`
- **Auth required** : `YES`
- **Request Header**:
  - `Content-Type` : `multipart/form-data`
- **Request Body (Optional)** :
  - `name` as `string` -` Nama`
  - `phone` as `text` - `nomor telephone`
  - `location` as `text` - `lokasi`
  - `gender` as `text` - `gender`
  - `image` as `file` - `File Foto Profile`
- **Response** :

```json
{
  "status": 201,
  "message": "Biodata updated successfully",
  "error": false
}
```
### Get Biodata

- **URL** : `/biodata/me`
- **Method** : `GET`
- **Auth required** : `YES`
- **Response**:

```json
{
    "status": 200,
    "message": "Biodata fetched successfully",
    "user": {
        "role": "user",
        "name": "johndoe",
        "email": "johndoe@example.com",
        "gender": "Pria",
        "phone": "08123456789",
        "location": "Amerika",
        "profileImageUrl": "https://storage.googleapis.com/storage-foundie/user/......"
    }
    "error": false
}
```

### User Follow

- **URL** : `/follow/:followingEmail`
- **Method** : `POST`
- **Auth required** : `YES`
- **Request Body** :
  - `followingEmail` as `string` - `Email Dari Pengguna Yang akan di Ikuti`
- **Response**:

```json
{
    "status": 201,
    "message": "Follow successfully created",
    "followId": "RQUdNOfr8XiKmavyrKN1",
    "data": {
        "followerEmail": "sansb746@gmail.com",
        "followingEmail": "johndoe@example.com",
        "timestamp": {}
    }
    "error": false
}
```
### User Unfollow

- **URL** : `/follow/:followingEmail`
- **Method** : `DELETE`
- **Auth required** : `YES`
- **Request Body** :
  - `followingEmail` as `string` - `Email Dari Pengguna Yang akan di unfollow`
- **Response**:

```json
{
    "status": 200,
    "message": "Unfollowed successfully",
    "error": false
}
```

### Get User Following and Follower

- **URL** : `/follow/data`
- **Method** : `GET`
- **Auth required** : `YES`
- **Response**:

```json
{
    "status": 200,
    "message": "Followers and following successfully retrieved",
    "data": {
        "Followers": [
            "sanseath2@gmail.com",
            "sansb746@gmail.com"
        ],
        "Following": [
            "sanseath2@gmail.com"
        ]
    }
    "error": false
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
  - 
- **Response** :

  ```json
  {
    "status": 201,
    "message": "Product successfully created",
    "documentName": "abc123",
    "data": {
      "id": "abc123",
      "name": "Lipstick",
      "description": "A long-lasting lipstick",
      "price": 10000,
      "category": "Makeup",
      "image": "https://storage.googleapis.com/your-bucket/makeup_products/1234567890_lipstick.jpg"
    }
    "error": false
  }
  
### List Product

- **URL** : `/products`
- **Method** : `GET`
- **Response** :
  
   ```json
  {
    "error": false,
    "status": "success",
    "data": {
        "Brand": "hanasui",
        "Product Title": "Hanasui Mattedorable Lip Cream 03 Star",
        "Variant Name": "03 Star",
        "Type": "lip",
        "Color Hex": "#e64468",
        "Color RGB": "(230, 68, 104)",
        "Season 1 Name": "spring warm",
        "Season 1 Percent": 50.09388903027193,
        "S1 Closest Color": "[251.0, 95.0, 87.0]",
        "Season 2 Name": "summer cool ",
        "Season 2 Percent": 49.90611096972805,
        "S2 Closest Color": "[208.0, 49.0, 79.0]",
        "Product URL": "https://hanasui.id/makeup/lip_cream"
    }
  }

### Filter Product

- **URL** : `/products/filter`
- **Method** : `POST`
- **Request Header**:
  - `Content-Type` : `multipart/form-data`
- **Request Body** :
  - `name` as `string` - `Product Title`
  - `season` as `string` - `Season Name`
- **Response** :
  
   ```json
  {
    "error": false,
    "status": "success",
    "data": {
        "Brand": "hanasui",
        "Product Title": "Hanasui Mattedorable Lip Cream 03 Star",
        "Variant Name": "03 Star",
        "Type": "lip",
        "Color Hex": "#e64468",
        "Color RGB": "(230, 68, 104)",
        "Season 1 Name": "spring warm",
        "Season 1 Percent": 50.09388903027193,
        "S1 Closest Color": "[251.0, 95.0, 87.0]",
        "Season 2 Name": "summer cool ",
        "Season 2 Percent": 49.90611096972805,
        "S2 Closest Color": "[208.0, 49.0, 79.0]",
        "Product URL": "https://hanasui.id/makeup/lip_cream"
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
  - `image` as `file` - `File gambar post maksimal 5 gambar`

- **Response** :

```json
{
  "status": 201,
  "message": "Post successfully created",
  "data": {
    "postId": "id post",
    "email": "email pengguna",
    "title": "judul post",
    "text": "teks post",
    "imageUrl": "url gambar post",
    "timestamp": "timestamp server"
  }
  "error": false
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
  "status": 200,
  "message": "Post and related data successfully deleted",
  "error": false
}
```

### Get Detail Post

- **URL** : `/community/:postId`
- **Method** : `GET`
- **Auth required** : `YES`
- **Permissions required** : `None`
- **URL Parameters** :
  - `postId` as `string` - `ID dari post`

- **Response** :
```json
{
  "status": 200,
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
  "error": false
}
```
### Get All Post Data
- **URL** : `/community`
- **Method** : `GET`
- **Auth required** : `YES`
- **Params Parameters** :
  - `q` as `string` - `Judul postingan yang dicari`
  - `l` as `number` - `Jumlah maksimal postingan yang ditampilkan`
  - `skip` as `number` - `Jumlah postingan awal yang dilewati`
  - `sort` as `string` - `Urutan postingan, **popular** untuk urutan berdasarkan likesCount, **default** berdasarkan waktu posting`
  - `example` - `http://localhost:3000/community?q=lipstik&l=1&sort=popular`
- **Response** :

```json
{
    "status": 200,
    "message": "Posts successfully retrieved",
    "data": [
        {
            "imageUrl": "https://storage.googleapis.com/storage-foundie/user/...",
            "postId": "yH9UWr5oqKsKWRap94D0",
            "text": "lorem",
            "title": "lisptik",
            "email": "johndoe@example.com",
            "timestamp": {
                "_seconds": 1716517459,
                "_nanoseconds": 973000000
            },
            "likesCount": 2
        }
    ]
    "error": false
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
  "status": 201,
  "message": "Comment successfully created",
  "data": {
    "commentId": "id komentar",
    "email": "email pengguna",
    "postId": "id post",
    "text": "teks komentar",
    "timestamp": "timestamp server"
  }
  "error": false
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
  "status": 200,
  "message": "Comment and related replies successfully deleted",
  "error": false
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
  "status": 201,
  "message": "Reply successfully created",
  "data": {
    "replyId": "id balasan",
    "email": "email pengguna",
    "commentId": "id komentar",
    "text": "teks balasan",
    "timestamp": "timestamp server"
  }
  "error": false
}
```
### Delete reply

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
  "status": 200,
  "message": "Reply successfully deleted",
  "error": false
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
  "status": 201,
  "message": "Like successfully created",
  "likeId": "id suka",
  "data": {
    "email": "email pengguna",
    "postId": "id post",
    "timestamp": "timestamp server"
  }
  "error": false
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
  "status": 200,
  "message": "Like successfully deleted",
  "error": false
}
```

## Community Group
### Create Group
- **URL** : `community/create`
- **Method** : `POST`
- **Auth required** : `YES`
- **Request Header**:
  - `Content-Type` : `multipart/form-data`
- **Request Body (Optional)** :
  - `title` as `string` -` Nama Group`
  - `topics` as `text` - `Topik yang akan di angkat di group untuk memisahkan topic bisa gunakan koma(,)`
  - `description` as `text` - `Deskripsi group`
  - `image` as `file` - `File Foto Profile Group`
- **Response** :

```json
{
    "statusCode": 201,
    "message": "Group successfully created",
    "groupId": "YnHnxPwwtgqALxgrNAQb",
    "data": {
        "creator": "test@api.com",
        "title": "TEST GROUP API",
        "imageUrl": "https://storage.googleapis.com/storage-foundie/groups/....",
        "topics": [
            "API",
            "TEST",
            "BACKEND"
        ],
        "description": "TEST GROUP API FOR NOW",
        "subscription": 0,
        "timestamp": {}
    }
}
```

### Group Subscription

- **URL** : `/community/:GroupID/subscribe`
- **Method** : `POST`
- **Auth required** : `YES`
- **Request Params** :
  - `GroupID` as `string` - `ID dari group yang akan user subscribe`
- **Response**:

```json
{
    "status": 201,
    "message": "Successfully joined the group",
    "membershipId": "Zgpb1sRiycmW3R5bsCMJ",
    "data": {
        "email": "test@api.com",
        "groupId": "YnHnxPwwtgqALxgrNAQb",
        "joinedAt": {}
    }
}
```

### Group Unsubs

- **URL** : `/community/:GroupID/unsubscribe`
- **Method** : `DELETE`
- **Auth required** : `YES`
- **Request Params** :
  - `GroupID` as `string` - `ID dari group yang akan user subscribe`
- **Response**:

```json
{
    "statusCode": 200,
    "message": "Successfully left the group",
    "error": false
}
```
