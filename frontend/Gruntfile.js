module.exports = function(grunt) {

	/**
	 * In the config options you'll need to provide all application-specific
	 * options, such as used components, modules, 3rd party libraries.
	 *
	 * - Please not include any unnecessary files.
	 * - For the best coding practices see the further description.
	 * - Take care of dependencies for the listed components as well.
	 *
	 */
	grunt.initConfig({
		meta: {
			package: grunt.file.readJSON('package.json'),

			/**
			 * Lists of used CORE components
			 * (ARRAY of Strings)
			 *
			 * Use the full name of component without extension, the building script will get the component's proper
			 * version automatically (if the core's structure follows the naming and placing conventions).
			 * Modules has to be a minified version already, so the used ones are going to compound only,
			 * all the rest will generate and optimize now.
			 *
			 */
			listOfUsedModules: [], // "modules/{{NameOfModule}}/dist/nameofmodule.min.js"
			listOfUsedControllers: [], // "controllers/{{NameOfController}}.js"
			listOfUsedDirectives: [], // "directives/{{NameOfDirective}}.js"
			listOfUsedServices: [], // "services/{{NameOfService}}.js"

			/**
			 * Application framework components
			 *
			 * List all mandatory components which are need to run
			 * - Use full URIs as these are coming from the package manager
			 * - Use minified version, as this will only copy/concat
			 *
			 */
			frameworkComponents: [
				'node_modules/angular/angular.min.js'
			],

			/**
			 * Application paths
			 * (Strings)
			 *
			 * Defines those input and output folders which are will use for generate, read and write the source files.
			 * Most of them are common in all projects, and follows the original CORE<->Project structure organisation.
			 *
			 */
			source: {
				coreControllers: 'core/js/app/controllers',
				coreDirectives: 'core/js/app/directives',
				coreModules: 'core/js/app/modules/%s/dist',
				coreServices: 'core/js/app/services',
				coreLib: 'core/js/lib', // as these are should be minified already, only will copy/concat
				projectControllers: 'src/js/app/controllers', // !TODO do we need other components? Other should be placed to common
				projectLib: 'src/js/lib', // as these are should be minified already, only will copy/concat
			},
			compile: {
				assetsFolder: '../deploy/assets',
				libs: 'libs.js', // framework + core libs + project libs
				application: 'application.js', // core services + core modules + core directives + core controllers + project controllers
				compileSepareFiles: false, // if `true` libs.js + application.js will concat (but huge)
				generateMaps: true // if `true` it's going to generate map extensions for everything
			}
		},

		watch: {
			configFiles: {
				files: ['Gruntfile.js'],
				options: {
					reload: true
				}
			}
		}

	});

	grunt.loadNpmTasks('grunt-contrib-watch');

};