package main

import (
	"math/rand"
	"strconv"
	"time"
)

var charset = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")

func init() {
	rand.Seed(time.Now().UnixNano())
}

func GenerateFakeUser() User {
	return User{
		Username: randUsername(),
		Discrim:  randDiscriminator(),
	}
}

func randUsername() string {
	const MAX_USERNAME_LEN = 32
	const MIN_USERNAME_LEN = 2

	nameLength := rand.Intn(MAX_USERNAME_LEN-MIN_USERNAME_LEN) + MIN_USERNAME_LEN

	return randseq(nameLength)
}

func randDiscriminator() string {
	return strconv.Itoa(rand.Intn(10_000-1_000) + 1_000)
}

func randseq(n int) string {
	b := make([]rune, n)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}
