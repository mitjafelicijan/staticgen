release:
	cd empty-project && zip -r ../bin/empty-project.zip ./*
	git add . && git commit -S -m "Packaging new release" && git push
	npm run np
