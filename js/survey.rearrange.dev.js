/*
Debugging functions for survey.rearrange.js.
Only gets imported if survey.utils.debug == true,
and if project is running from a web server.
*/
(function(root) {
	var rearrange = root;
	var dev = rearrange.dev;

	dev.testbed = function() {
		var scratch = survey.data.get_dependencies;
		survey.data.get_dependencies = function(surveyId, elements, succ, err) {
			var deps =
			{
				10:
				[{
					dep_id: 12,
					triggers: [""]
				},{
					dep_id: 13,
					triggers: [""]
				}],

				11:
				[{
					dep_id: 10,
					triggers: [""]
				},{
					dep_id: -10,
					triggers: [""]
				}],

				12:
				[{
					dep_id: 13,
					triggers: [""]
				}],
				'-10': // apparently negative numbers are no-no
				[{
					dep_id: 11,
					triggers: [""]
				}]
			};

			succ(deps);
		}

		function test_set() {
			var test_set = [
			{
				element_id: 10
			},{
				element_id: 11
			},{
				element_id: 12
			},{
				element_id: 13
			},{
				// Circular dependencies (excluded)
				element_id: -10
			},{
				// Isolated node
				element_id: 19
			}
			];
			return test_set;
		}

		dev.debug(test_set(), 0);

		/*
		This benchmark is theoretical, as it only measures
		the performance of create_workspace + get_element.

		How much the different implementations affects
		actual performance, will depend on a survey's size
		and dependency relations.
		*/
		function benchmark(create, get, name, num_tests) {
			var scratch_create = dev.get_create_workspace();
			var scratch_get = dev.get_get_element();

			dev.set_create_workspace(create);
			dev.set_get_element(get);

			var elements = [];
			for (var i = 0; i < num_tests; i++) {
				elements[i] = {element_id: i};
			}

			var t0 = new Date().getMilliseconds();
			var workspace = dev.get_create_workspace()(elements);
			for (var i = 0; i < num_tests; i++) {
				dev.get_get_element()(i, workspace);
			}
			var t1 = new Date().getMilliseconds();

			var delta = t1 - t0;
			console.log(name+'\t'+delta+'ms');

			dev.set_create_workspace(scratch_create);
			dev.set_get_element(scratch_get);
		}

		var num_tests = 1000;
		console.log('\nBENCHMARK ('+num_tests+' OPERATIONS)');
		benchmark(
			dev.create_workspace_array,
			dev.get_element_array,
			'array',
			num_tests);
		benchmark(
			dev.create_workspace_object,
			dev.get_element_object,
			'object',
			num_tests);

		survey.data.get_dependencies = scratch;
	}

	// Rearrange elements and print debugging information
	dev.debug = function(elements, surveyId) {
		function succ(arr) {
			console.log("OLD\tNEW");
			for (var idx in elements) {
				var elem = arr[idx];
				console.log(elements[idx].element_id +
					(elem? '\t'+arr[idx].element_id:""));
			}

			console.log("\nKEPT ELEMENTS");
			arr.forEach(function(elem) {
				console.log(JSON.stringify(elem));
			});
		}

		function err() {
			console.log('Something went wrong. :-(');
		}

		rearrange(elements, surveyId, succ, err);
	}
})(survey.rearrange);