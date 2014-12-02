module.exports = function(grunt) {

	/**
	 * Global setup for building process
	 */
	var compoundAllFiles = false, // if `true` libs.js + application.js will concat (but huge)
		generateMaps = true; // if `true` it's going to generate map extensions for everything

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
			listOfUsedModules: ['ModulesAaa', 'ModulesBbb', 'ModulesCcc', 'Counter', 'Message'], // "modules/{{NameOfModule}}/dist/nameofmodule.min.js"
			listOfUsedControllers: ['formController', 'moonfruitController', 'ControllersCcc'], // "controllers/{{NameOfController}}.js"
			listOfUsedDirectives: ['DirectivesAaa', 'DirectivesBbb', 'DirectivesCcc', 'directiveName'], // "directives/{{NameOfDirective}}.js"
			listOfUsedServices: ['ServicesAaa', 'ServicesBbb', 'ServicesCcc', 'postService', 'provisioningService'], // "services/{{NameOfService}}.js"

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
				coreModules: 'core/js/app/modules/%%/dist',
				coreServices: 'core/js/app/services',
				coreLib: 'core/js/lib', // as these are should be minified already, only will copy/concat
				projectControllers: 'src/js/app/controllers', // !TODO do we need other components? Other should be placed to common
				projectLib: 'src/js/lib', // as these are should be minified already, only will copy/concat
			},
			compile: {
				assetsFolder: '../deploy/assets',
				libs: 'libs.js', // framework + core libs + project libs
				application: 'application.js', // core services + core modules + core directives + core controllers + project controllers
			}
		},

		watch: {
			configFiles: {
				files: ['Gruntfile.js'],
				options: {
					reload: true
				}
			}
		},

		concat: {
			buildCoreLib: { // Concat library (3rd party) files into the assets folder
				files: [{
					src: ['<%= meta.frameworkComponents %>', '<%= meta.source.coreLib %>/**/*.js', '<%= meta.source.projectLib %>/**/*.js'],
					dest: '<%= meta.compile.assetsFolder %>/js/<%= meta.compile.libs %>'
				}]
			},
			compoundAppFiles: { // Compound all application files are libs into one big file
				files: [{
					src: ['<%= meta.compile.assetsFolder %>/js/<%= meta.compile.libs %>', '<%= meta.compile.assetsFolder %>/js/<%= meta.compile.application %>'],
					dest: '<%= meta.compile.assetsFolder %>/js/<%= meta.compile.application %>'
				}]
			}
		},

		uglify: {
			options: {
				banner: '/*! <%= meta.package.name %> - v<%= meta.package.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */',
				compress: {
					drop_console: true
				},
				sourceMap: (compoundAllFiles === true) ? false : generateMaps,
				mangle: false,
				unused: false,
				drop_debugger: true,
				ie_proof: true
			},
			appFiles: {
				files: [{
					src: ['temp/services/**/*.js', 'temp/modules/**/*.js', 'temp/directives/**/*.js', 'temp/controllers/**/*.js', '<%= meta.source.projectLib %>/**/*.js'],
					dest: '<%= meta.compile.assetsFolder %>/js/<%= meta.compile.application %>'
				}]
			}
		}


	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask("cleartempfiles", "Clear temporary files", function() {
		grunt.file.delete('temp/', {
			force: true
		});
	});

	grunt.registerTask("createappfiles", "Concat/Uglify/Minify application files by given options", function() {
		var gConfig = grunt.config.get('meta'),
			i = 0,
			copyFile = function(srcpath, filename, component, i, minified) {
				var file = (minified) ? filename.toLowerCase() + '.min.js' : filename + '.js',
					src = (minified) ? srcpath.replace('%%', filename) + '/' + file : srcpath + '/' + file,
					dest = 'temp/' + component + 's/' + i + '_' + file;

				try {
					grunt.file.copy(src, dest);
				} catch (e) {
					console.error('ERROR No such file:', e.origError.path);
				}
			};

		for (var i = 0; i < gConfig.listOfUsedServices.length; i += 1) {
			copyFile(gConfig.source.coreServices, gConfig.listOfUsedServices[i], 'service', i, false);
		}

		for (var i = 0; i < gConfig.listOfUsedModules.length; i += 1) {
			copyFile(gConfig.source.coreModules, gConfig.listOfUsedModules[i], 'module', i, true);
		}

		for (var i = 0; i < gConfig.listOfUsedDirectives.length; i += 1) {
			copyFile(gConfig.source.coreDirectives, gConfig.listOfUsedDirectives[i], 'directive', i, false);
		}

		for (var i = 0; i < gConfig.listOfUsedControllers.length; i += 1) {
			copyFile(gConfig.source.coreControllers, gConfig.listOfUsedControllers[i], 'controller', i, false);
		}



		grunt.task.run('uglify:appFiles');

		if (compoundAllFiles === true) {
			grunt.task.run('concat:compoundAppFiles');
		}

		grunt.task.run('cleartempfiles');
	});

	grunt.registerTask('default', ['concat:buildCoreLib', 'createappfiles']);

};