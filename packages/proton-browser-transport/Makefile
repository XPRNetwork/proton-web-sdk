SRC_FILES := $(shell find src -name '*.ts')

all: lib

lib: ${SRC_FILES} package.json tsconfig.json node_modules rollup.config.js
	@./node_modules/.bin/rollup -c && touch lib

.PHONY: lint
lint: node_modules
	@./node_modules/.bin/eslint src --ext .ts --fix

.PHONY: publish
publish: | distclean node_modules
	@git diff-index --quiet HEAD || (echo "Uncommitted changes, please commit first" && exit 1)
	@git fetch origin && git diff origin/master --quiet || (echo "Changes not pushed to origin, please push first" && exit 1)
	@yarn config set version-tag-prefix "" && yarn config set version-git-message "Version %s"
	@yarn publish && git push && git push --tags

node_modules:
	yarn install --non-interactive --frozen-lockfile --ignore-scripts

.PHONY: clean
clean:
	rm -rf lib/

.PHONY: distclean
distclean: clean
	rm -rf node_modules/
