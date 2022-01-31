package main

import (
	"math/rand"
	"time"
)

const charset = "abcdefghijklmnopqrstuvwxyz" +
	"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

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

	b := make([]byte, nameLength)

	for i := range b {
		b[i] = charset[rand.Intn(nameLength)]
	}

	return string(b)
}

func randDiscriminator() string {
	return string(rand.Intn(10_000-1_000) + 1_000)
}
