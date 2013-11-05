/*
Takes an unordered array of data elements, and
returns them ordered based on their dependencies.

Usage: var arranged = rearrange(unordered_array);
*/

var create_workspace = create_workspace_array;
var get_element = get_element_array;
var extract_arrangement = extract_arrangement_array;

var test_set = [
{
	element_id: 10,
	unreadable_id: 20
},{
	element_id: 11,
	unreadable_id: 21
},{
	element_id: 12,
	unreadable_id: 22
},{
	element_id: 13,
	unreadable_id: 23
}
];

var arr = rearrange(test_set);
print("OLD\tNEW");
for (var idx in arr) {
	print(test_set[idx].element_id+'\t'+arr[idx].element_id);
}

function rearrange(elements) {
	var workspace = create_workspace(elements);
	
	elements.forEach(function(elem) {
		var deps = fetch_dependencies(elem);
		register_dependencies(elem, deps, workspace);
	});
	
	return extract_arrangement(workspace);
}

function fetch_dependencies(elem) {
	//TODO: Actually execute a fetch
	
	var deps = [];
	switch (elem.element_id) {
	case 10:
		deps = [{
			dep_id: 12,
			triggers: [""]
		},{
			dep_id: 13,
			triggers: [""]
		}];
		break;
	case 11:
		deps = [{
			dep_id: 10,
			triggers: [""]
		}];
		break;
	case 12:
		deps = [{
			dep_id: 13,
			triggers: [""]
		}];
		break;
	case 13:
		break;
	}
	
	return deps;
}

function register_dependencies(elem, deps, workspace) {
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

function extract_element(elem, arrangement) {
	arrangement.push(elem);
	
	var child = elem.dependents;
	while (child) {
		if (--child.dep_count == 0) {
			extract_element(child, arrangement);
		}
		
		child = child.next;
	}
	
	//TODO: This will cause unreachable nodes
	// to never get cleaned. Should improve.
	clean_element(elem);
	
	return arrangement;
}

// Removes an elements temporary members
// used by rearrange.js privately.
function clean_element(elem) {
	//TODO
}


// ARRAY AS WORKSPACE
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

function extract_arrangement_array(workspace) {
	var arrangement = [];
	
	var root = workspace.free_queue;
	if (!root) return arrangement;
	do {
		extract_element(root, arrangement);
	} while (root = root.next);
	
	return arrangement;
}


//TODO: HASH TABLE (?) AS WORKSPACE
