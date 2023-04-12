# Running

We're using [Celery]() to run your dynamics on the background asynchronously. With it, we also setup a message queue with [Redis]() to do this communication, so we'll need to make Visual Dynamics run the way it was designed to we need to:

- Install [Docker]()
- Install a [Redis]() instance with Docker
- Setup and auto-start the `celery.service` and `celery-flower.service` (`flower` is optional)

### Install Docker

Docker is a container engine that helps with fast deployment of inumerous tools, it guarantees the same system container in any host OS, thus the tools will run the same on Linux, MacOS and Windows.

To install Docker on your machine you can go to [their documentation](https://docs.docker.com/get-docker/) and follow their instructions.

### Install a Redis instance with Docker

We will be using Docker to keep our Redis instance up. To do so, just run the command:

```sh
sudo docker run --name visualdynamics-redis -p 6379:6379 -d redis
```

This will create a container named `visualdynamics-redis` (`--name` param), it will be acessible to the host machine at port `6379` (`-p` param), which is the default, and will use the `redis` docker image.

### Setup and auto-start the `celery.service` and `celery-flower.service` (`flower` is optional)

When you download the repository, on `apps/server` you will have two `.service` files:

- `celery.service`
- `celery-flower.service`

The first one, `celery.service`, is required to make Visual Dynamics run smoothly.
The second one, `celery-flower.service`, is an optional visual interface to running tasks on Celery.

You will need to modify a few things there:
- `User`: Should be your current username on the system.
- `Group`: The group in which you want to run this (on Arch, I'm running on `wheel`)
- `WorkingDirectory`: The absolute path to the first `server` folder, e.g.: `/home/ivopr/git/visualdynamics2/apps/server`
- `ExecStart`: The command this unit should execute, here you just need to change the `/path/to/your/venv/bin/celery` part to `theSameAsWorkingDirectoryAbove/.venv/bin/celery`, with `theSameAsWorkingDirectoryAbove` being the sabe path you provided to `WorkingDirectory`.

These instructions applies to both files. When changed, you should copy them over to `/etc/systemd/system`:
- `celery.service`:
  Inside the `server` folder, run: `sudo cp celery.service /etc/systemd/system/celery.service`

- `celery-flower.service`:
  Inside the `server` folder, run: `sudo cp celery-flower.service /etc/systemd/system/celery-flower.service`

If you did everything the right way, you should be able to run:
```sh
sudo systemctl enable --now celery
```
and/or
```sh
sudo systemctl enable --now celery-flower
```

You can check their statuses with `systemctl status celery` and `systemctl status celery-flower`

If you couldn't get this working, don't hesitate to open an Issue or Discussion on the repository so that we can help you.