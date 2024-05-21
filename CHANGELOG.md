## [2.0.1](https://github.com/dasprid/jsonapi-zod-query/compare/v2.0.0...v2.0.1) (2024-05-21)


### Bug Fixes

* **deserializer:** infer  output from TLinksSchema ([24402b2](https://github.com/dasprid/jsonapi-zod-query/commit/24402b2c779f077358dda5022a13770cdf82b28e))

# [2.0.0](https://github.com/dasprid/jsonapi-zod-query/compare/v1.6.0...v2.0.0) (2024-05-14)


### Features

* refactor deserialization process ([41b8b5d](https://github.com/dasprid/jsonapi-zod-query/commit/41b8b5dddf1e62e74dab38fd3807635941b494d6))


### BREAKING CHANGES

* _links and _meta are now not included in resources by default
anymore.

# [1.6.0](https://github.com/dasprid/jsonapi-zod-query/compare/v1.5.1...v1.6.0) (2024-05-13)


### Features

* export collection page params type ([1f6d398](https://github.com/dasprid/jsonapi-zod-query/commit/1f6d398c43243578652a80483b153b9905a07a1e))

## [1.5.1](https://github.com/dasprid/jsonapi-zod-query/compare/v1.5.0...v1.5.1) (2024-04-28)


### Bug Fixes

* **deserializer:** handle inference of omitted deserializer properties ([6c8793b](https://github.com/dasprid/jsonapi-zod-query/commit/6c8793bb3a10ce2a68a41dced31ed0f42ca019c2))
* **parser-schemas:** assert return types for document schema creators ([deca970](https://github.com/dasprid/jsonapi-zod-query/commit/deca9707361d0231ee2a3d64689ce1b7b4604013))

# [1.5.0](https://github.com/dasprid/jsonapi-zod-query/compare/v1.4.1...v1.5.0) (2024-04-22)


### Features

* export Selector type ([b59ed45](https://github.com/dasprid/jsonapi-zod-query/commit/b59ed45920a11bd11c4b244967c8c08d47e6a4d1))

## [1.4.1](https://github.com/dasprid/jsonapi-zod-query/compare/v1.4.0...v1.4.1) (2024-04-22)


### Bug Fixes

* set defaults for ResourceDeserializer type ([d46e01f](https://github.com/dasprid/jsonapi-zod-query/commit/d46e01f388ca991bdd20304b85ccf8ca08374b00))

# [1.4.0](https://github.com/dasprid/jsonapi-zod-query/compare/v1.3.0...v1.4.0) (2024-04-22)


### Features

* allow specifying document meta schema ([33f7152](https://github.com/dasprid/jsonapi-zod-query/commit/33f71523f10c0c2233a4419e814299c5af4d8414))

# [1.3.0](https://github.com/dasprid/jsonapi-zod-query/compare/v1.2.6...v1.3.0) (2024-04-15)


### Features

* export additional types from deserializer ([5459078](https://github.com/dasprid/jsonapi-zod-query/commit/54590789d76448811f169672b9bf1e6ba944c315))

## [1.2.6](https://github.com/dasprid/jsonapi-zod-query/compare/v1.2.5...v1.2.6) (2024-03-30)


### Bug Fixes

* **deserializer:** append attributes and relationships to ResourceResult in a cleaner way ([4ecbce1](https://github.com/dasprid/jsonapi-zod-query/commit/4ecbce1855695069c1be5e936db95df5486e4e19))

## [1.2.5](https://github.com/dasprid/jsonapi-zod-query/compare/v1.2.4...v1.2.5) (2024-03-20)


### Bug Fixes

* **deserializer:** properly infer resource result for relationships ([73e4f9d](https://github.com/dasprid/jsonapi-zod-query/commit/73e4f9d7a5265773d5f6094accc816b3e920b8b0))

## [1.2.4](https://github.com/dasprid/jsonapi-zod-query/compare/v1.2.3...v1.2.4) (2024-03-19)


### Bug Fixes

* adjust typings for relationship deserializers ([fa85eda](https://github.com/dasprid/jsonapi-zod-query/commit/fa85edafddce1fb30eb4dc3eff6cc23cc685741b))

## [1.2.3](https://github.com/dasprid/jsonapi-zod-query/compare/v1.2.2...v1.2.3) (2024-02-16)


### Bug Fixes

* **build:** set filename of build to index.js ([1d09a04](https://github.com/dasprid/jsonapi-zod-query/commit/1d09a0475d44431096af3589ee2da29c0b268fd2))

## [1.2.2](https://github.com/dasprid/jsonapi-zod-query/compare/v1.2.1...v1.2.2) (2024-02-15)


### Bug Fixes

* **deserializer:** do not allow page params to be null ([aec78e0](https://github.com/dasprid/jsonapi-zod-query/commit/aec78e03a3b891caa6f0f39df5771caa6a1cf699))

## [1.2.1](https://github.com/dasprid/jsonapi-zod-query/compare/v1.2.0...v1.2.1) (2024-02-15)


### Bug Fixes

* **pagination:** always return undfined when there's no link ([882ffe9](https://github.com/dasprid/jsonapi-zod-query/commit/882ffe9193050740b1f0409865c22cc5f086efd1))

# [1.2.0](https://github.com/dasprid/jsonapi-zod-query/compare/v1.1.2...v1.2.0) (2024-02-15)


### Bug Fixes

* remove createPaginatedCollectionSelector from index export ([a496085](https://github.com/dasprid/jsonapi-zod-query/commit/a4960858393f21b38ee66df9a10dec5843056da9))


### Features

* move page param parsing into collection selector ([a8416c4](https://github.com/dasprid/jsonapi-zod-query/commit/a8416c4ca10aec17c4f09badb8a59f5c3903242a))

## [1.1.2](https://github.com/dasprid/jsonapi-zod-query/compare/v1.1.1...v1.1.2) (2024-02-15)


### Bug Fixes

* **selector:** remove double type nesting ([66f45cf](https://github.com/dasprid/jsonapi-zod-query/commit/66f45cf97eeddf762194ce794fe080947278f8d6))

## [1.1.1](https://github.com/dasprid/jsonapi-zod-query/compare/v1.1.0...v1.1.1) (2024-02-15)


### Bug Fixes

* **selector:** infer data for collection DocumentResult ([e54c82e](https://github.com/dasprid/jsonapi-zod-query/commit/e54c82e043b24d9292062ac2a710f08c5baf990a))

# [1.1.0](https://github.com/dasprid/jsonapi-zod-query/compare/v1.0.1...v1.1.0) (2024-02-15)


### Features

* allow proper JSON:API parsing ([0af0eaa](https://github.com/dasprid/jsonapi-zod-query/commit/0af0eaab1d0cbc45c03e36eb4df9458cabfc76c4))

## [1.0.1](https://github.com/dasprid/tanstack-query-json-api/compare/v1.0.0...v1.0.1) (2024-02-01)


### Bug Fixes

* include module and types properties in package.json ([757dff2](https://github.com/dasprid/tanstack-query-json-api/commit/757dff2dca800c6aaf3bb2281b84f8c310bb1e71))

# 1.0.0 (2024-01-31)


### Features

* initial commit ([37eef06](https://github.com/dasprid/tanstack-query-json-api/commit/37eef06bd60294dd0c096a878619ff45fffab436))
