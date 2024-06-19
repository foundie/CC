# Backend for Foundie
> Capstone Project ENTS-H120

### Development backend link : 
- **NEST JS** : **https://foundie-backend-dev-b3pq7ueuta-uc.a.run.app/**
- **HAPI JS** : **https://foundie-backend-hapijs-dev-b3pq7ueuta-uc.a.run.app**
- **FlASK**   : **http://34.71.32.242/**

### API GATEWAY
- **https://foundie-backend-dev-b3pq7ueuta-uc.a.run.app/**


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

### Gmail Verifikasi

- **URL** : `/auth/verify`
- **Method** : `POST`
- - **Request** Body:
  - `token` as `string`
- **Response**:

```json
{
    "status": 200,
    "message": "logged in successfully",
    "user": {
        "name": "contigency contract",
        "email": "sanseath2@gmail.com",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InNhbnNlYXRoMkBnbWFpbC5jb20iLCJzdWIiOiIxMDkyMDc1MjExODU2MzkyNTYwMTQiLCJpYXQiOjE3MTc2NTc5NDgsImV4cCI6MTcxNzkxNzE0OH0.o7z20yYy4zyzCZ_Gbu8XeQFaJbvrFDrKr0RwponbYII"
    },
    "setPassword": false,
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
  - `description` as `text` - `description`
  - `profileImage` as `file` - `File Foto Profile`
  - `coverImage` as `file` - `File Foto Sampul Profile`
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
        "email": "test@api.com",
        "gender": "hexadesimal",
        "phone": "123456789",
        "location": "aaaaaaa",
        "profilePictureUrl": "https://storage.googleapis.com/storage-foundie/user/test%40api.com/...",
        "name": "TES API",
        "coverPictureUrl": "https://storage.googleapis.com/storage-foundie/user/test%40api.com/...",
        "description": "text description after edit",
        "followersCount": 1,
        "followingCount": 1
    }
    "error": false
}
```

### add password
- **URL** : `/biodata/add-password`
- **Method** : `POST`
- **Auth required** : `YES`
- **Request Body** :
  - `email` as `string` - `email pengguna`
  - `password` as `string` - `Password`
- **Response** :

```json
{
    "status": 200,
    "message": "Password added successfully",
    "error": false
}
```

### User Follow

- **URL** : `/follow/:followingEmail`
- **Method** : `POST`
- **Auth required** : `YES`
- **Request Params** :
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
- **Request Params** :
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
        "GroupMemberships": [
            {
                "groupId": "YnHnxPwwtgqALxgrNAQb",
                "title": "TEST GROUP API"
            }
        ]
    }
    "error": false
}
```


### Get Detail User Profile

- **URL** : `/biodata/:email`
- **Method** : `GET`
- **Auth required** : `YES`
- **Permissions required** : `None`
- **URL Parameters** :
  - `Email` as `string` - `Email User`

- **Response** :
```json
{
    "status": 200,
    "message": "User profile fetched successfully",
    "data": {
        "user": {
            "email": "test@api.com",
            "gender": "hexadesimal",
            "phone": "123456789",
            "location": "",
            "profileImageUrl": "https://storage.googleapis.com/storage-foundie/",
            "name": "TES API",
            "coverImageUrl": "https://storage.googleapis.com/storage-foundie/",
            "followersCount": 1,
            "followingCount": 1
        },
        "posts": [
            {
                "likesCount": 0,
                "titleArray": [
                    "TEST",
                    "API"
                ],
                "createdTimestamp": 1717384978619,
                "postId": "B7S9lyeLyuVTOlbX18J6",
                "text": "TEST API AFTER EDITED",
                "title": "TEST API",
                "email": "test@api.com",
                "timestamp": "09-06-2024 09:40"
                "imageUrls": [
                    "https://storage.googleapis.com/storage-foundie/user/"
                ]
            },
            {
                "groupPost": true,
                "groupId": "kZ5xRRLTUGpPIiarYshX",
                "imageUrls": [
                    "https://storage.googleapis.com/storage-foundie/groups/kZ5xRRLTUGpPIiarYshX/posts/",
                    "https://storage.googleapis.com/storage-foundie/groups/kZ5xRRLTUGpPIiarYshX/posts/"
                ],
                "postId": "yFGUrqxJGwqFTSxlRACb",
                "text": "LOREM IPMSUM",
                "title": "TEST GROUP API POST",
                "email": "test@api.com",
                "timestamp": "09-06-2024 09:40"
            }
        ],
        "groups": [
            {
                "groupId": "kZ5xRRLTUGpPIiarYshX",
                "email": "test@api.com",
                "joinedAt": "09-06-2024 09:37"
            },
            {
                "groupId": "rW7AcqwrnsPncg6f02xB",
                "email": "test@api.com",
                "joinedAt": "09-06-2024 09:37"
            }
        ],
    },
    "error": false
}
```

## Predict Feature

### Face Classification

- **URL** : `/predict/face`
- **Method** : `POST`
- **Request Header**:
  - `Content-Type` : `multipart/form-data`
- **Request Body** :
  - `image` as `file` - `User's Face`
- **Response** :

  ```json
  {
    "error": false,
    "status": "success",
    "data": {
        "predicted_class": "High Visual Weight",
        "message": "Jenis klasifikasi wajah Anda adalah High Visual Weight",
    }
  }

### Skin Tone

- **URL** : `/predict/skin`
- **Method** : `POST`
- **Request Header**:
  - `Content-Type` : `multipart/form-data`
- **Request Body** :
  - `image` as `file` - `User's Face`
- **Response** :

  ```json
  {
    "status": 200,
    "error": false,
    "result": "Light",
    "message": "Berikut rekomendasi produk untuk anda : "
    "product": [
        {
        "Image": "https://hanasui.id/front-end/assets/img/product_image/bf83c7d933d5f63108fb3b2c327f8cf3.png",
        "Brand": "hanasui",
        "Product Title": "Hanasui Mattedorable Lip Cream 03 Star",
        "Variant Name": "03 Star",
        "Tone": "fair_light",
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
        },
      ]
  }
``

### Color analysis

- **URL** : `/predict/color`
- **Method** : `POST`
- **Auth required** : `YES`
- **Request Body:**
  - `brightnessLevel` as `number` - `Tingkat kecerahan yang diinginkan, rentang nilai dari 1 (terang) hingga 5 (gelap).`
  - `bluePreferences` as `number` - `Preferensi untuk warna biru, nilai 0 (hangat) atau 1 (dingin).`
  - `yellowPreferences` as `number` - `Preferensi untuk warna kuning, nilai 0 (hangat) atau 1 (dingin).`
  - `greenPreferences` as `number` - `Preferensi untuk warna hijau, nilai 0 (hangat) atau 1 (dingin).`
  - `pinkPreferences` as `number` - `Preferensi untuk warna merah muda, nilai 0 (hangat) atau 1 (dingin).`
  - `brownPreferences` as `number` - `Preferensi untuk warna coklat, nilai 0 (hangat) atau 1 (dingin).`
  - `clarityLevel` as `number` - `Tingkat kejernihan yang diinginkan, rentang nilai dari 1 (jernih) hingga 5 (kabur).`
- **Response** :

```json
{
    "status": 200,
    "message": "Color analysis successfully completed",
    "data": {
        "dominantCharacteristic": "cool",
        "secondaryCharacteristic": "light",
        "colorSeason": "Winter Cool",
        "seasonCompatibilityPercentages": {
            "Autumn Deep": 4,
            "Winter Deep": 11,
            "Spring Light": 6,
            "Summer Light": 13,
            "Autumn Soft": 4,
            "Summer Soft": 11,
            "Spring Clear": 6,
            "Winter Clear": 13,
            "Autumn Warm": 3,
            "Spring Warm": 4,
            "Summer Cool": 13,
            "Winter Cool": 14
        },
        "type": "color analysis"
    },
    "error": false
}
```


### Predict Histori
- **URL** : `/predict/history`
- **Method** : `GET`
- **Auth required** : `YES`
- **Response**:

```json
{
    "status": 200,
    "error": false,
    "message": "History records retrieved successfully.",
    "data": [
        {
            "type": "Color Analysis"
            "colorSeason": "Winter Cool",
            "seasonCompatibilityPercentages": {
                "Autumn Soft": 4,
                "Spring Warm": 4,
                "Summer Cool": 13,
                "Spring Clear": 6,
                "Spring Light": 6,
                "Autumn Warm": 3,
                "Summer Soft": 11,
                "Summer Light": 13,
                "Winter Clear": 13,
                "Autumn Deep": 4,
                "Winter Cool": 14,
                "Winter Deep": 11
            },
            "email": "test@api.com",
            "dominantCharacteristic": "Cool",
            "secondaryCharacteristic": "Light",
        },
        {
            "prediction": "High Visual Weight",
            "message": "Jenis klasifikasi wajah Anda adalah High Visual Weight",
            "type": "face classification",
            "email": "test@api.com"
        },
        {
            "message": "Berikut rekomendasi produk untuk anda : ",
            "type": "skin tone",
            "email": "test@api.com",
            "result": "Medium",
            "products": [
               {
        	      "Image": "https://hanasui.id/front-end/assets/img/product_image/bf83c7d933d5f63108fb3b2c327f8cf3.png",
        	      "Brand": "hanasui",
        	      "Product Title": "Hanasui Mattedorable Lip Cream 03 Star",
        	      "Variant Name": "03 Star",
        	      "Tone": "fair_light",
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
               },
            ]
        }
    ]
}
```

## Products

### List Product

- **URL** : `/products`
- **Method** : `GET`
- **Parameters** :
  - `limit` as `int`, `optional`
  - `skip` as `int`, `optional`
- **Example** : `https://foundie-backend-dev-b3pq7ueuta-uc.a.run.app/products?limit=1&skip=0`
- **Response** :
  
   ```json
  {
    "error": false,
    "status": "success",
    "data": [
   {
        "Image": "https://hanasui.id/front-end/assets/img/product_image/bf83c7d933d5f63108fb3b2c327f8cf3.png",
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
    },
   ]
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
        "Image": "https://hanasui.id/front-end/assets/img/product_image/bf83c7d933d5f63108fb3b2c327f8cf3.png",
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

### Compare Product

- **URL** : `/products/compare`
- **Method** : `GET`
- **Parameters** :
  - `index` as `int`
- **Response** :

  ```json
  {
    "error": false,
    "status": "success",
    "data": {
        "Image": "https://hanasui.id/front-end/assets/img/product_image/bf83c7d933d5f63108fb3b2c327f8cf3.png",
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
### Edit Post

- **URL** : `/community/postId`
- **Method** : `PATCH`
- **Auth required** : `YES`
- **Permissions required** : `None`
- **URL Parameters** :
  - `postId` as `string` - `ID dari postingan yang akan di edit`
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
  "message": "Post successfully updated",
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
      "timestamp": "timestamp server",
      "profileImageUrl": "https://storage.googleapis.com/storage-foundie/user/test%40api.com/...",
      "name": "TES API"
    },
    "comments": [
      {
        "commentId": "id komentar",
        "postId": "id post",
        "email": "email pengguna",
        "text": "teks komentar",
        "timestamp": "timestamp server",
        "profileImageUrl": "https://storage.googleapis.com/storage-foundie/user/test%40api.com/...",
        "name": "TES API"
        "replies": [
          {
            "replyId": "id balasan",
            "commentId": "id komentar",
            "email": "email pengguna",
            "text": "teks balasan",
            "timestamp": "timestamp server",
            "profileImageUrl": "https://storage.googleapis.com/storage-foundie/user/test%40api.com/...",
            "name": "TES API"
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
            "timestamp": "03-06-2024 10:25",
            "likesCount": 2,
            "profileImageUrl": "https://storage.googleapis.com/storage-foundie/user/test%40api.com/...",
            "name": "TES API"
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
> NOTE: untuk fitur comment, reply, like, delete, edit, dan detail post untuk postingan grup sama seperti postingan user
### Create Group
- **URL** : `/community/create`
- **Method** : `POST`
- **Auth required** : `YES`
- **Request Header**:
  - `Content-Type` : `multipart/form-data`
- **Request Body (Optional)** :
  - `title` as `string` -` Nama Group`
  - `topics` as `text` - `Topik yang akan di angkat di group untuk memisahkan topic bisa gunakan koma(,)`
  - `description` as `text` - `Deskripsi group`
  - `profileImage` as `file` - `File Foto Profile Group`
  - `coverImage` as `file` - `File Foto Sampul Group`
- **Response** :

```json
{
    "status": 201,
    "message": "Group successfully created",
    "error": false
    "data": {
        "id": "XPnquqG6kQ4cYidIGomy",
        "creator": "test@api.com",
        "title": "TEST GROUP API",
        "profileImageUrl": "https://storage.googleapis.com/storage-foundie/groups/...",
        "coverImageUrl": "https://storage.googleapis.com/storage-foundie/groups/...",
        "topics": [
            "API",
            "TEST",
            "GROUP"
        ],
        "description": "BLALALALALALALA",
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
    "error": false
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

### Add Group Post

- **URL** : `/community/:groupId/post`
- **Method** : `POST`
- **Auth required** : `YES`
- **Permissions required** : `None`
- **URL Parameters** :
  - `groupId` as `string` - `ID dari group`
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
    "groupPost": true,
    "groupId": "qwsdawedawokeaasd",
    "postId": "id post",
    "email": "email pengguna yang telah join ke grup",
    "title": "judul post",
    "text": "teks post",
    "imageUrl": "url gambar post",
    "timestamp": "timestamp server"
  }
  "error": false
}
```

### Get All Group Post Data
- **URL** : `/community/:groupId/posts`
- **Method** : `GET`
- **Auth required** : `YES`
- **Params Parameters** :
  - `q` as `string` - `Judul postingan yang dicari`
  - `l` as `number` - `Jumlah maksimal postingan yang ditampilkan`
  - `skip` as `number` - `Jumlah postingan awal yang dilewati`
  - `sort` as `string` - `Urutan postingan, **popular** untuk urutan berdasarkan likesCount, **default** berdasarkan waktu posting`
  - `example` - `http://localhost:3000/community/YnHnxPwwtgqALxgrNAQb/posts?q=TEST&l=1&skip=2&sort=popular`
- **Response** :

```json
{
    "status": 200,
    "message": "Posts successfully retrieved",
    "data": [
        {
            "groupPost": true,
            "groupId": "YnHnxPwwtgqALxgrNAQb",
            "postId": "N8rOud2GWYet40HItg0s",
            "text": "TEST API",
            "email": "test@api.com",
            "timestamp": "09-06-2024 09:40"
            "likesCount": 1,
            "imageUrls": [
                "https://storage.googleapis.com/storage-foundie/groups/YnHnxPwwtgqALxgrNAQb/posts/...."
            ],
            "title": "TEST POST GROUP EDIT",
            "profileImageUrl": "https://storage.googleapis.com/storage-foundie/user/test%40api.com/...",
            "name": "TES API"
        }
    ],
    "error": false
}
```

### Get All Group Data
- **URL** : `/community/group/search`
- **Method** : `GET`
- **Auth required** : `YES`
- **Params Parameters** :
  - `q` as `string` - `Judul atau topic yang dicari`
  - `l` as `number` - `Jumlah maksimal postingan yang ditampilkan`
  - `skip` as `number` - `Jumlah postingan awal yang dilewati`
  - `sort` as `string` - `Urutan postingan, **popular** untuk urutan berdasarkan subscription, **default** berdasarkan waktu di buat`
  - `example` - ` http://localhost:3000/community/group/search?q=test&sort=popular`
- **Response** :

```json
{
    "status": 200,
    "message": "Groups successfully retrieved",
    "error": false
    "data": [
        {
            "creator": "test@api.com",
            "coverImageUrl": "https://storage.googleapis.com/storage-foundie/groups/...",
            "topics": [
                "API",
                "TEST",
                "GROUP"
            ],
            "description": "BLALALALALALALA",
            "id": "kZ5xRRLTUGpPIiarYshX",
            "title": "TEST GROUP API ",
            "profileImageUrl": "https://storage.googleapis.com/storage-foundie/groups/...D",
            "timestamp": "09-06-2024 09:37",
            "subscription": 2
        },
        {
            "creator": "test@api.com",
            "topics": [
                "API",
                "TEST",
                "GROUP",
                "KOSONG"
            ],
            "id": "rW7AcqwrnsPncg6f02xB",
            "subscription": 1,
            "timestamp": "09-06-2024 09:37",
            "title": "TEST GROUP API EDITED",
            "profileImageUrl": "https://storage.googleapis.com/storage-foundie/groups/...",
            "coverImageUrl": "https://storage.googleapis.com/storage-foundie/groups/....",
            "description": "TEST GROUP API KOSONG YANG DI EDIT DONE"
        }
    ]
}
```

### Get All users Data
- **URL** : `/community/user/search`
- **Method** : `GET`
- **Auth required** : `YES`
- **Params Parameters** :
  - `q` as `string` - `nama atau email yang dicari`
  - `l` as `number` - `Jumlah maksimal postingan yang ditampilkan`
  - `skip` as `number` - `Jumlah postingan awal yang dilewati`
  - `sort` as `string` - `Urutan postingan, **popular** untuk urutan berdasarkan Followes Count, **default** berdasarkan A-Z `
  - `example` - `http://localhost:3000/community/user/search?q=Louis`
- **Response** :

```json
{
    "status": 200,
    "message": "users successfully retrieved",
    "error": false
    "data": [
        {
            "name": "Louis Michael",
            "email": "aplikasitesterandro@gmail.com",
            "followersCount": 0
        },
        {
            "name": "Louis Michael",
            "email": "jvs99@outlook.com",
            "profileImageUrl": "https://storage.googleapis.com/storage-foundie/user/jvs99%40outlook.com/profilePicture",
            "followersCount": 0
        },
        {
            "name": "Louis Michael",
            "email": "lostvape01@gmail.com",
            "followersCount": 0
        },
        {
            "name": "Louis Michael",
            "email": "lostvape@gmail.com",
            "followersCount": 0
        },
        {
            "name": "Louis Michael A504D4KY3637",
            "email": "a504d4ky3637@bangkit.academy",
            "followersCount": 0
        }
    ]
}
```

