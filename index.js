const path = require("path");
const vueDocs = require("vue-docgen-api");

const generate = require('escodegen').generate;
const toAst = require('to-ast');

module.exports = function(source, map) {
	
//   console.log('vsvsv', source);
  const file = this.request.split("!").pop();
//   console.log('filw', file)
  let docs = {};
  try {
    docs = vueDocs.parseSource(source, file);
	// console.log('docs', this)
	console.log(docs);

    if (docs.props) {
        const props = docs.props;
        Object.keys(props).forEach(key => {
            if (props[key].tags && props[key].tags.ignore) {
                delete props[key];
            }
        });
    }

    if (docs.methods) {
        docs.methods.map(method => {
            method.tags.public = [
                {
                    title: 'public',
                    description: null,
                    type: null,
                },
            ];
            const params = method.tags.params;
            if (params) {
                method.tags.param = params;
                delete method.tags.params;
            }
            return method;
        });
    }
  } catch (err) {
    /* istanbul ignore next */
    const componentPath = path.relative(process.cwd(), file);
    const message = `Cannot parse ${componentPath}: ${err}\n`;
    console.warn(message);
  }

  const componentProps = docs.props;
  if (componentProps) {
	  // Transform the properties to an array. This will allow sorting
	  // TODO: Extract to a module
	  const propsAsArray = Object.keys(componentProps).reduce((acc, name) => {
		  componentProps[name].name = name;
		  acc.push(componentProps[name]);
		  return acc;
	  }, []);

	//   const sortProps = config.sortProps || defaultSortProps;
	//   docs.props = sortProps(propsAsArray);
  }

	return `
		if (module.hot) {
			module.hot.accept([])
		}

		module.exports = ${generate(toAst(docs))}
	`;
};