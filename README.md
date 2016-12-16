# MQ-hack-day
VR web app w/ gesture based controls

============

## Up and Running:

Set up the credentials (go wild w/ this key)

```
echo "MQ_API_KEY=FsamFHTPoenx0vrUdboTC9cyK9Hb2TE2" >> .env
```

```
$ git clone [this repo]
$ cd [this repo]
$ cd api && nodemon

open a new terminal tab

$ cd [this repo]/client
$ php -S localhost:1234 (must be this exact port)
```

#### 1) Visit localhost:1234/form.html

#### 2) Enter six locations (locations *must* be one word - sorry!)

##### Example locations:

LA, NY, CO, MI or Michigan, Chicago, California, Russia, Germany, Itlay

##### Cannot be: "Los Angeles", "Colorado Springs"

3) the form will redirect you to localhost:1234,
if you see a *black screen* refresh the page as the static maps API may be latent

4) In the top right hand corner of the screen, try waving you hard in front of the small (and extremely hard to see) icons. Each one will do something differnt.

- Bubbles icon adds bubbles
- Rotate icon makes the scene spin around with no work
- 'X' icon clears the scene and removes bubbles
