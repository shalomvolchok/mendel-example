build:
	docker run -it --rm -p 80:80 --name prod -v $(PWD):/wp --entrypoint bash node:6.5.0 \
	-c "cd wp && npm run build"

prod:
	docker run -it --rm -p 80:80 --name prod -v $(PWD):/wp --entrypoint bash node:6.5.0 \
	-c "cd wp && node server.js"

dev:
	docker run -it --rm --env-file ./.env -p 80:80 --name abcloud-reduxtpl-dev -v $(PWD):/abedit --entrypoint bash node:6.5.0 \
	-c "cd wp && npm run dev"
