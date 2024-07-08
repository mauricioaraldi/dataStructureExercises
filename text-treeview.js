/* This code is made by David Lidström (dlid)
 * Repo: https://github.com/dlid/text-treeview/tree/master
 *
 * MIT License
 *
 * Copyright (c) 2018 David Lidström
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

function isSimpleType(obj) {
    return (obj === null ||
        typeof obj === "string" 
        || typeof obj === "number"
        || typeof obj === "boolean"
        || typeof obj === "function"
        || (obj.constructor && obj.constructor.prototype == Array.prototype));
}

function mergeObjects(rootObject, nextObject) {
    if (typeof rootObject === "undefined" || rootObject === null) {
        return rootObject;
    }

    if (typeof nextObject == "undefined") {
        return rootObject;
    }

    if (isSimpleType(rootObject) || isSimpleType(nextObject)) {
        rootObject = nextObject;
    } else {
        mergeObjectProperties(rootObject, nextObject);
    }

    return rootObject;
}


function mergeObjectProperties(rootObject, nextObject) {
    var propertyNames = Object.keys(rootObject);

    Object.keys(rootObject).forEach(propertyName => {
        if (typeof nextObject[propertyName] !== "undefined") {
            rootObject[propertyName] = extend(rootObject[propertyName], nextObject[propertyName]);
        }
    })


    Object.keys(nextObject).forEach(propertyName => {
        if (!rootObject[propertyName]) {
            rootObject[propertyName] = nextObject[propertyName];
        }
    });
}

function extend() {
    if (arguments.length == 0) {
        return {};
    } else if (arguments.length == 1) {
        return arguments[0];
    }

    var parameters = Array.prototype.slice.call(arguments),
        rootObject = parameters.shift(),
        nextObject = parameters.shift();

    rootObject = mergeObjects(rootObject, nextObject);

    if (parameters.length > 0) {
        parameters.unshift(rootObject);
        return extend.apply(this, Array.prototype.slice.call(parameters));
    }

    return rootObject;
}

module.exports = extend;

const CONST_NODE = "│  ";
const CONST_END_NODE = "└─ ";
const CONST_LEAF_NODE = "├─ ";
const CONST_EMPTY_SPACE = "   ";

function parseConfig(config) {
    var newConfig = {
            $indents : [],
            $root : true,
            showRootLines : true,
            format : format
        };
   
    if (typeof config === "boolean") {
        config = {showRootLines : config};
    }
    newConfig = extend(newConfig, config);
    if (newConfig.format !== null && typeof newConfig.format !== "function") {
        throw "format must be a function"
    }
    return newConfig;
}


function format(indents, treeNode, node) {
    return `${indents.join('')}${treeNode}${node.text}\n`;
}

function treeItNice(nodes, config) {
    var indicatorsEnabled = true,
        result = "";

    config = parseConfig(config);

    if (config.$root === true && config.showRootLines === false) {
        indicatorsEnabled = false;
    }

    nodes.forEach((node, ix) => {
        result += createNode(node, config, ix == nodes.length -1, indicatorsEnabled);
    });

    return result;
}


function createNode(node, config, isLast, indicatorsEnabled) {
    var treeIndicator = "",
        result = "";

    if (typeof node === "string") {
        node = {text : node};
    }

    if (indicatorsEnabled) {
        treeIndicator = isLast ? CONST_END_NODE : CONST_LEAF_NODE;
    }

    result += config.format(config.$indents, treeIndicator, node, config.$parent);
    if (node.children) {
        result += createChildNodes(node, config, indicatorsEnabled, isLast);
    }
    
    return result;
}

function createChildNodes(node, config, indicatorsEnabled, isLast) {
    var childConfig =  extend({},config, {
        showRootLines : config.showRootLines,
        $indents : config.$indents.concat( indicatorsEnabled ? ( isLast ? CONST_EMPTY_SPACE : CONST_NODE ) : []),
        $root : false,
        $parent : node
    });
    return treeItNice(node.children, childConfig);
}


module.exports = treeItNice;
