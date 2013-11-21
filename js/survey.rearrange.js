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
	var self = rearrange;
	root.rearrange = self;

	var create_workspace = create_workspace_object;
	var get_element = get_element_object;

	// Dev access (should run from web server)
	if (survey.utils.debug) {
		self.dev = {
			create_workspace_array:		create_workspace_array,
			get_element_array:			get_element_array,
			create_workspace_object:	create_workspace_object,
			get_element_object:			get_element_object,

			set_create_workspace: function(func) {
				create_workspace = func;
			},
			set_get_element: function(func) {
				get_element = func;
			},
			get_create_workspace: function() {
				return create_workspace;
			},
			get_get_element: function() {
				return get_element;
			}
		};

		$('body').append('<script src="js/survey.rearrange.dev.js"></script>');
	}


	function rearrange(elements, surveyId, success, error) {
		function succ(deps) {
			var workspace = create_workspace(elements);
			elements.forEach(function(elem) {
				var dep = deps[elem.id];
				elem.dependencies = dep? dep:[];

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
				var dep = get_element(descriptor.id, workspace);
				dep.dependents = enqueue(elem, dep.dependents);
			});
		}
	}

	function print_queue(msg, queue) {
		var cur = queue;
		var str = '';
		while (cur) {
			str += cur.id + '->';
			cur = cur.next;
		}
		console.log(msg+': '+str+'null');
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
		print_queue("dependents of "+root.id, root.dependents);
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
			console.log(elem.id+"'s child:"+child.id);
			if (--child.dep_count == 0) {
				extract_element(child, arrangement);
			}
			
			child = child.next;
		}
		
		// TODO: This will cause unreachable nodes
		// to never get cleaned. Should improve?
		//clean_element(elem);
		
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
			if (elem.id == id) {
				found = elem;
				return false;
			} else {
				return true;
			}
		});
		
		return found;
	}


	/** OBJECT (HASH TABLE) AS WORKSPACE **/
	function create_workspace_object(elements) {
		var workspace = {};
		var o = {};

		elements.forEach(function(elem) {
			o[elem.id] = elem;
		});

		workspace.elements = o;
		workspace.free_queue = null;
		return workspace;
	}

	function get_element_object(id, workspace) {
		return workspace.elements[id];
	}

})(survey);
