/*
~ rearrange (asynchronous)
Takes an unordered array of data elements, and
returns them ordered based on their dependencies.

Usage: survey.rearrange(elements, surveyId, success, error);
success receives the rearranged array as it's only parameter.

Array 'dependencies' is added to all elements;
elements with no dependencies have an empty array.

Elements with circular dependencies (i.e impossible
to unlock) are excluded from the rearrangement.
*/
(function(root) {
	// Rearrange data elements
	// rearrange(elements, surveyId, success, error)
	root.rearrange = rearrange;

	// Debug data elements
	// rearrange.debug(elements, surveyId)
	root.rearrange.debug = debug;

	// Run debug with offline, predefined test data
	// rearrange.testbed()
	root.rearrange.testbed = testbed;

	/** /
	var create_workspace = create_workspace_array;
	var get_element = get_element_array;//*/
	/**/
	var create_workspace = create_workspace_object;
	var get_element = get_element_object;//*/

	function testbed() {
		root.data = {};
		var scratch = root.data.get_dependencies;
		root.data.get_dependencies = function(surveyId, elements, succ, err) {
			root.data.get_dependencies = scratch;
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

			// Simulate system settings
			deps = JSON.stringify(deps);
			deps = JSON.parse(deps);

			succ(deps);
		}

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

		debug(test_set, 0);
	}

	// Rearrange elements and print debugging information
	function debug(elements, surveyId) {
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

	function rearrange(elements, surveyId, success, error) {
		function succ(deps) {
			var workspace = create_workspace(elements);
			elements.forEach(function(elem) {
				var wrapper = Object.getOwnPropertyDescriptor(
					deps, elem.element_id);
				elem.dependencies = wrapper? wrapper.value:[];
				register_dependencies(elem, workspace);
			});
			
			success(extract_arrangement(workspace));
		}

		function err(req, status, err) {
			console.log('Rearranging failed (status=' + status+'):');
			console.log(err);
			error();
		}

		root.data.get_dependencies(surveyId, elements, succ, err);
	}

	function register_dependencies(elem, workspace) {
		var deps = elem.dependencies;
		elem.dep_count = deps.length;
		
		if (elem.dep_count == 0) {
			workspace.free_queue = enqueue(elem, workspace.free_queue);
		} else {
			deps.forEach(function(descriptor) {
				var dep = get_element(descriptor.dep_id, workspace);
				dep.dependents = enqueue(elem, dep.dependents);
			});
		}
	}

	// Allows duplicates, returns the head.
	// The queue is circular reversed only.
	function enqueue(elem, queue) {
		if (!queue) {
			elem.prev = elem;
			elem.next = null;
			queue = elem;
		} else {
			var tail = queue.prev;
			queue.prev = elem;
			tail.next = elem;
			elem.next = null;
		}
		
		return queue;
	}

	function extract_arrangement(workspace) {
		var arrangement = [];
		
		var root = workspace.free_queue;
		while (root) {
			var tmp = root.next;
			extract_element(root, arrangement);
			root = tmp;
		}
		
		return arrangement;
	}

	function extract_element(elem, arrangement) {
		arrangement.push(elem);
		
		var child = elem.dependents;
		while (child) {
			if (--child.dep_count == 0) {
				extract_element(child, arrangement);
			}
			
			child = child.next;
		}
		
		// TODO: This will cause unreachable nodes
		// to never get cleaned. Should improve?
		clean_element(elem);
		
		return arrangement;
	}

	// Removes an element's temporary members
	// used by rearrange.js privately.
	function clean_element(elem) {
		delete elem.dependents;
		delete elem.dep_count;
		delete elem.prev;
		delete elem.next;
	}


	/** ARRAY AS WORKSPACE **/
	function create_workspace_array(elements) {
		var workspace = {};
		workspace.elements = elements;
		workspace.free_queue = null;
		return workspace;
	}

	function get_element_array(id, workspace) {
		var found = null;
		workspace.elements.every(function(elem) {
			if (elem.element_id == id) {
				found = elem;
				return false;
			} else {
				return true;
			}
		});
		
		return found;
	}


	/** OBJECT AS WORKSPACE **/
	function create_workspace_object(elements) {
		var workspace = {};
		var o = {};

		elements.forEach(function(elem) {
			//Object.defineProperty(o, elem.element_id, elem);
			o[elem.element_id] = elem;
		});

		workspace.elements = o;
		workspace.free_queue = null;
		return workspace;
	}

	function get_element_object(id, workspace) {
		//return Object.getOwnPropertyDescriptor(workspace.elements, id);
		return workspace.elements[id];
	}

})(survey);
