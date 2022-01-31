package main

import (
	"bytes"
	"encoding/base64"
	"html/template"
	"log"
	"os"

	"github.com/go-rod/rod"
	"github.com/go-rod/rod/lib/proto"
	"github.com/go-rod/rod/lib/utils"
)

const WIDTH = 8_000
const HEIGHT = WIDTH / 4

type (
	TemplateParam struct {
		Width, Height int
		Users         []User
	}

	User struct {
		Username, Discrim string
	}
)

func main() {
	file, err := os.ReadFile("template.html")
	if err != nil {
		log.Fatal(err)
	}

	tmpl := string(file)

	var lotsOfUsers []User

	for i := 0; i < 1_000; i++ {
		lotsOfUsers = append(lotsOfUsers, GenerateFakeUser())
	}

	data := TemplateParam{
		Height: HEIGHT,
		Width:  WIDTH,
		Users:  lotsOfUsers,
	}

	t, err := template.New("owo").Parse(tmpl)
	if err != nil {
		log.Fatal(err)
	}

	var out bytes.Buffer
	err = t.Execute(&out, data)
	if err != nil {
		log.Fatal(err)
	}

	screenshot(out.String())
}

func makeDataURL(html string) string {
	encoded := base64.StdEncoding.EncodeToString([]byte(html))
	return "data:text/html;base64," + encoded
}

func screenshot(html string) {
	url := makeDataURL(html)

	page := rod.New().MustConnect().MustPage(url).MustWaitLoad()
	page.SetViewport(&proto.EmulationSetDeviceMetricsOverride{
		Width:  WIDTH,
		Height: HEIGHT,
	})

	img, err := page.Screenshot(false, &proto.PageCaptureScreenshot{
		Format: proto.PageCaptureScreenshotFormatPng,
	})
	if err != nil {
		log.Fatal(err)
	}

	utils.OutputFile("output.png", img)
}
