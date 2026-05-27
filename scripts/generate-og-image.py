from PIL import Image, ImageDraw, ImageFont

WIDTH = 1200
HEIGHT = 630
OUT = "public/og-image.png"

REGULAR = "/System/Library/Fonts/Supplemental/Arial.ttf"
BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"


def font(size, bold=False):
    return ImageFont.truetype(BOLD if bold else REGULAR, size)


def lerp(a, b, t):
    return int(a + (b - a) * t)


def gradient(size):
    image = Image.new("RGB", size)
    start = (239, 246, 255)
    mid = (224, 242, 254)
    end = (204, 251, 241)
    pixels = image.load()

    for y in range(size[1]):
        for x in range(size[0]):
            t = (x / size[0] * 0.72) + (y / size[1] * 0.28)
            if t < 0.62:
                k = t / 0.62
                color = tuple(lerp(start[i], mid[i], k) for i in range(3))
            else:
                k = (t - 0.62) / 0.38
                color = tuple(lerp(mid[i], end[i], k) for i in range(3))
            pixels[x, y] = color

    return image


img = gradient((WIDTH, HEIGHT)).convert("RGBA")
draw = ImageDraw.Draw(img)

draw.ellipse((842, -96, 1178, 240), fill=(167, 243, 208, 76))
draw.ellipse((-30, 310, 390, 730), fill=(186, 230, 253, 160))
draw.rounded_rectangle((70, 70, 1130, 560), radius=44, fill=(255, 255, 255, 220), outline=(186, 230, 253, 255), width=3)

draw.rounded_rectangle((96, 96, 184, 184), radius=24, fill=(56, 169, 236, 255))
draw.ellipse((112, 112, 168, 168), outline=(255, 255, 255, 255), width=5)
draw.arc((121, 112, 159, 168), 90, 270, fill=(255, 255, 255, 255), width=4)
draw.arc((121, 112, 159, 168), -90, 90, fill=(255, 255, 255, 255), width=4)
draw.line((116, 134, 164, 134), fill=(255, 255, 255, 255), width=4)
draw.line((116, 150, 164, 150), fill=(255, 255, 255, 255), width=4)

draw.text((210, 104), "IP Check", font=font(34, True), fill=(15, 23, 42, 255))
draw.text((210, 146), "Reliable IP intelligence", font=font(22), fill=(100, 116, 139, 255))

draw.text((96, 250), "IP lookup and", font=font(72, True), fill=(15, 23, 42, 255))
draw.text((96, 334), "geolocation details", font=font(72, True), fill=(15, 23, 42, 255))
draw.text((96, 432), "Check IP geolocation, ISP, ASN, and timezone", font=font(30), fill=(71, 85, 105, 255))

draw.rounded_rectangle((798, 238, 1064, 488), radius=28, fill=(239, 246, 255, 255), outline=(191, 219, 254, 255), width=2)
items = [("Location", 286), ("Network", 358), ("Signals", 430)]
for label, y in items:
    draw.rounded_rectangle((830, y - 22, 1028, y + 22), radius=12, fill=(224, 242, 254, 255))
    draw.ellipse((846, y - 8, 862, y + 8), fill=(56, 169, 236, 255))
    draw.text((884, y - 14), label, font=font(24, True), fill=(15, 23, 42, 255))

img.save(OUT)
