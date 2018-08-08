var gulp = require('gulp');
var handlebars = require('gulp-handlebars');
var wrap = require('gulp-wrap');
var declare = require('gulp-declare');
var concat = require('gulp-concat');
var gutil = require('gulp-util');
var clean = require('gulp-clean');
var path = require('path');

var paths = require('../paths.js');
var helpers = require('../helpers/helpers.js');

var tmpAppsHTML = [];
var appsToInclude = helpers.getAppsToInclude();

appsToInclude.forEach(function(app) {
	tmpAppsHTML.push(paths.tmp + '/apps/' + app + '/views/*.html');
	tmpAppsHTML.push(paths.tmp + '/apps/' + app + '/submodules/*/views/*.html');
});

var pathsTemplates = {
	whole: {
		src: tmpAppsHTML,
		dest: paths.tmp + '/js/',
		concatName: 'templates-compiled.js'
	},
	app: {
		src: [
			paths.app + 'views/*.html',
			paths.app + '/submodules/*/views/*.html'
		],
		dest: paths.app + 'views/',
		concatName: 'templates.js'
	}
};

function compileTemplates() {
	var mode = gutil.env.app ? 'app' : 'whole';
	return gulp
		.src(pathsTemplates[mode].src)
		.pipe(handlebars({
			handlebars: require('handlebars')
		}))
		.pipe(wrap('Handlebars.template(<%= contents %>)'))
		.pipe(declare({
			namespace: 'monster.cache.templates',
			noRedeclare: true, // Avoid duplicate declarations ,
			processName: function(filePath) {
				var splits = filePath.split(path.sep),
					indexSub = splits.indexOf('submodules'),
					newName;
					// our files are all in folder such as apps/accounts/views/test.html, so we want to extract the last and 2 before last parts to have the app name and the template name
					// If it's in a submodule then it's like apps/common/accountBrowser/views/accountBrowser-list.html, so we want the last, 2 before last, and 4 before last to extract the app, submodule and template names
					if(indexSub >= 0) {
						newName = splits[splits.length - 5] + '._' + splits[splits.length - 3] + '.' + splits[splits.length-1];
					}
					else {
						newName = splits[splits.length - 3] +'._main.' + splits[splits.length-1];
					}

				return declare.processNameByPath(newName);
			}
		}))
		.pipe(concat(pathsTemplates[mode].concatName))
		.pipe(gulp.dest(pathsTemplates[mode].dest));
}

// Concats the existing templates.js with the compiledTemplates
function concatTemplatesWhole() {
	var existingFile = 'templates.js';
	return gulp
		.src([
			pathsTemplates['whole'].dest + existingFile,
			pathsTemplates['whole'].dest + pathsTemplates['whole'].concatName
		])
		.pipe(concat(existingFile))
		.pipe(gulp.dest(pathsTemplates['whole'].dest));
}

function cleanTemplateWhole() {
	var filesToClean = (pathsTemplates['whole'].src).concat(pathsTemplates['whole'].dest + pathsTemplates['whole'].concatName);
	return gulp
		.src(filesToClean, {
			read: false
		})
		.pipe(clean());
}

function concatJsApp() {
	var appFile = 'app.js';
	return gulp
		.src([
			paths.app + appFile,
			pathsTemplates.app.dest + pathsTemplates.app.concatName
		])
		.pipe(concat(appFile))
		.pipe(gulp.dest(paths.app));
}

function cleanTemplatesApp() {
	var filesToClean = (pathsTemplates['app'].src).concat(pathsTemplates['app'].dest + pathsTemplates['app'].concatName);
	return gulp
		.src(filesToClean, {
			read: false
		})
		.pipe(clean());
}


/*******************************************************************************************************************************/
/************************************************* WHOLE SPECIFIC **************************************************************/
gulp.task('templates', gulp.series(compileTemplates, concatTemplatesWhole, cleanTemplateWhole));


/*******************************************************************************************************************************/
/************************************************* APP SPECIFIC ****************************************************************/
gulp.task('templates-app', gulp.series(compileTemplates, concatJsApp, cleanTemplatesApp));
