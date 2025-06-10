import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const currentProcess = process.cwd();
const controllerPathOutput = path.join(currentProcess, 'Controllers')

// Function to get templates path
function getTemplatesPath() {
    // Check if we're running from built version
    const isBuilt = __dirname.includes('dist');
    
    if (isBuilt) {
        // Running from dist folder
        return path.join(__dirname, 'templates');
    } else {
        // Running from source (dev mode)
        return path.join(__dirname, '../templates');
    }
}

// Function to pluralize controller names
function pluralize(name) {
    const lastChar = name.slice(-1).toLowerCase();
    const lastTwoChars = name.slice(-2).toLowerCase();
    
    // Rules for pluralization
    if (lastTwoChars === 'us') {
        return name + 'es'; // Campus -> Campuses
    } else if (lastChar === 's' || lastChar === 'x' || lastChar === 'z' || 
               lastTwoChars === 'ch' || lastTwoChars === 'sh') {
        return name + 'es'; // Class -> Classes, Box -> Boxes
    } else if (lastChar === 'y' && !'aeiou'.includes(name.slice(-2, -1).toLowerCase())) {
        return name.slice(0, -1) + 'ies'; // Category -> Categories
    } else if (lastChar === 'f' || lastTwoChars === 'fe') {
        if (lastTwoChars === 'fe') {
            return name.slice(0, -2) + 'ves'; // Life -> Lives
        } else {
            return name.slice(0, -1) + 'ves'; // Leaf -> Leaves
        }
    } else {
        return name + 's'; // Product -> Products
    }
}

// Function to detect namespace from current path
function detectNamespace() {
    const currentPath = currentProcess;
    
    try {
        // Try to find .csproj file to get project name
        const csprojFiles = fs.readdirSync(currentPath).filter(file => file.endsWith('.csproj'));
        if (csprojFiles.length > 0) {
            const projectName = path.basename(csprojFiles[0], '.csproj');
            return projectName;
        }
    } catch (error) {
        // Ignore errors and continue to fallback
    }
    
    // If no .csproj, check for common .NET project patterns
    const pathParts = currentPath.split(path.sep);
    
    // Look for common .NET project indicators
    for (let i = pathParts.length - 1; i >= 0; i--) {
        const part = pathParts[i];
        if (part.includes('.Api') || part.includes('.Web') || part.includes('.Core') || 
            part.includes('.Application') || part.includes('.Domain') || part.includes('.Infrastructure')) {
            return part;
        }
    }
    
    // Fallback to current directory name
    return path.basename(currentPath);
}

// Function to generate controller files for a single controller
function generateControllerFiles(name, namespace, roles, outputPath, templatesPath) {
    const actions = [];
    const pluralName = pluralize(name);

    roles.forEach(role => {
        const controllerPath = `${outputPath}/${pluralName}/${role}/${pluralName}Controller.cs`;
        const dtoPath = `${outputPath}/${pluralName}/${role}/${pluralName}DTO.cs`;
        const servicePath = `${outputPath}/${pluralName}/${role}/${pluralName}Service.cs`;
        const templatePath = `${outputPath}/${pluralName}/${role}/${pluralName}Template.cs`;

        actions.push(
            {
                type: 'add',
                path: controllerPath,
                templateFile: path.join(templatesPath, 'controller.hbs'),
                skipIfExists: true, // Skip if file exists
                data: { 
                    type: role,
                    pluralName: pluralName,
                    singularName: name,
                    namespace: namespace
                }
            },
            {
                type: 'add',
                path: dtoPath,
                templateFile: path.join(templatesPath, 'dto.hbs'),
                skipIfExists: true,
                data: { 
                    type: role,
                    pluralName: pluralName,
                    singularName: name,
                    namespace: namespace
                }
            },
            {
                type: 'add',
                path: servicePath,
                templateFile: path.join(templatesPath, 'service.hbs'),
                skipIfExists: true,
                data: { 
                    type: role,
                    pluralName: pluralName,
                    singularName: name,
                    namespace: namespace
                }
            },
            {
                type: 'add',
                path: templatePath,
                templateFile: path.join(templatesPath, 'template.hbs'),
                skipIfExists: true,
                data: { 
                    type: role,
                    pluralName: pluralName,
                    singularName: name,
                    namespace: namespace
                }
            }
        );
    });

    return actions;
}

export default function (plop) {
    const detectedNamespace = detectNamespace();
    const templatesPath = getTemplatesPath();
    
    // Single Controller Generator
    plop.setGenerator('controller', {
        description: 'Generate C# Controller structure with multiple roles',
        prompts: [
            {
                type: 'input',
                name: 'name',
                message: 'Enter controller name (e.g., Product, Category):',
                validate: function (value) {
                    if (!value || value.trim() === '') {
                        return 'Controller name is required';
                    }
                    return true;
                },
                filter: function (value) {
                    return value.charAt(0).toUpperCase() + value.slice(1);
                }
            },
            {
                type: 'input',
                name: 'namespace',
                message: 'Enter base namespace:',
                default: detectedNamespace,
                validate: function (value) {
                    if (!value || value.trim() === '') {
                        return 'Namespace is required';
                    }
                    return true;
                }
            },
            {
                type: 'input',
                name: 'roles',
                message: 'Enter roles (comma separated, e.g., Admin,User,Manager,SuperAdmin):',
                default: 'Admin,User',
                validate: function (value) {
                    if (typeof value === 'string') {
                        if (!value || value.trim() === '') {
                            return 'At least one role is required';
                        }
                    } else if (Array.isArray(value)) {
                        if (value.length === 0) {
                            return 'At least one role is required';
                        }
                    }
                    return true;
                },
                filter: function (value) {
                    if (typeof value === 'string') {
                        return value.split(',')
                            .map(role => role.trim())
                            .filter(role => role !== '')
                            .map(role => role.charAt(0).toUpperCase() + role.slice(1));
                    }
                    return value;
                }
            },
            {
                type: 'input',
                name: 'outputPath',
                message: 'Enter output path:',
                default: controllerPathOutput
            }
        ],
        actions: function (data) {
            return generateControllerFiles(data.name, data.namespace, data.roles, data.outputPath, templatesPath);
        }
    });

    // Multiple Controllers Generator
    plop.setGenerator('multi-controller', {
        description: 'Generate multiple C# Controllers at once',
        prompts: [
            {
                type: 'input',
                name: 'controllers',
                message: 'Enter controller names (comma separated, e.g., Product,Category,Order,Customer):',
                validate: function (value) {
                    if (!value || (typeof value === 'string' && value.trim() === '')) {
                        return 'At least one controller name is required';
                    }
                    return true;
                },
                filter: function (value) {
                    // Ensure value is a string
                    if (typeof value !== 'string') {
                        value = String(value);
                    }
                    
                    return value.split(',')
                        .map(name => {
                            if (typeof name !== 'string') {
                                name = String(name);
                            }
                            return name.trim();
                        })
                        .filter(name => name !== '')
                        .map(name => name.charAt(0).toUpperCase() + name.slice(1));
                }
            },
            {
                type: 'input',
                name: 'namespace',
                message: 'Enter base namespace:',
                default: detectedNamespace,
                validate: function (value) {
                    if (!value || (typeof value === 'string' && value.trim() === '')) {
                        return 'Namespace is required';
                    }
                    return true;
                }
            },
            {
                type: 'input',
                name: 'roles',
                message: 'Enter roles for all controllers (comma separated, e.g., Admin,User,Manager):',
                default: 'Admin,User',
                validate: function (value) {
                    if (typeof value === 'string') {
                        if (!value || value.trim() === '') {
                            return 'At least one role is required';
                        }
                    } else if (Array.isArray(value)) {
                        if (value.length === 0) {
                            return 'At least one role is required';
                        }
                    }
                    return true;
                },
                filter: function (value) {
                    // Ensure value is a string
                    if (typeof value !== 'string') {
                        if (Array.isArray(value)) {
                            return value;
                        }
                        value = String(value);
                    }
                    
                    return value.split(',')
                        .map(role => {
                            if (typeof role !== 'string') {
                                role = String(role);
                            }
                            return role.trim();
                        })
                        .filter(role => role !== '')
                        .map(role => role.charAt(0).toUpperCase() + role.slice(1));
                }
            },
            {
                type: 'input',
                name: 'outputPath',
                message: 'Enter output path:',
                default: controllerPathOutput
            }
        ],
        actions: function (data) {
            const allActions = [];
            
            // Ensure controllers is an array
            let controllers = data.controllers;
            if (!Array.isArray(controllers)) {
                controllers = [controllers];
            }
            
            // Generate files for each controller
            controllers.forEach(controllerName => {
                const actions = generateControllerFiles(controllerName, data.namespace, data.roles, data.outputPath, templatesPath);
                allActions.push(...actions);
            });

            // Add a summary action
            allActions.push({
                type: 'add',
                path: `${data.outputPath}/.generation-summary.txt`,
                template: `Generated ${controllers.length} controllers: ${controllers.join(', ')}
With roles: ${Array.isArray(data.roles) ? data.roles.join(', ') : data.roles}
Namespace: ${data.namespace}
Generated at: ${new Date().toLocaleString()}
=====================================`
            });

            return allActions;
        }
    });

    // Batch Generator với file config
    plop.setGenerator('batch-controller', {
        description: 'Generate controllers from JSON config file',
        prompts: [
            {
                type: 'input',
                name: 'configFile',
                message: 'Enter path to JSON config file (e.g., ./controllers-config.json):',
                default: './controllers-config.json',
                validate: function (value) {
                    if (!value || value.trim() === '') {
                        return 'Config file path is required';
                    }
                    try {
                        const configPath = path.resolve(value);
                        if (!fs.existsSync(configPath)) {
                            return `Config file not found: ${configPath}`;
                        }
                        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                        if (!config.controllers || !Array.isArray(config.controllers)) {
                            return 'Config file must have "controllers" array';
                        }
                        return true;
                    } catch (error) {
                        return `Invalid config file: ${error.message}`;
                    }
                }
            },
            {
                type: 'input',
                name: 'outputPath',
                message: 'Enter output path (optional, will use config default):',
                default: ''
            }
        ],
        actions: function (data) {
            const configPath = path.resolve(data.configFile);
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            const outputPath = data.outputPath || config.outputPath || controllerPathOutput;
            const namespace = config.namespace || detectedNamespace;
            
            const allActions = [];
            
            config.controllers.forEach(controllerConfig => {
                const name = controllerConfig.name;
                const roles = controllerConfig.roles || config.defaultRoles || ['Admin', 'User'];
                const controllerNamespace = controllerConfig.namespace || namespace;
                
                const actions = generateControllerFiles(name, controllerNamespace, roles, outputPath, templatesPath);
                allActions.push(...actions);
            });

            return allActions;
        }
    });

    // Quick presets
    plop.setGenerator('preset-admin-user', {
        description: 'Quick: Generate with Admin and User only',
        prompts: [
            {
                type: 'input',
                name: 'name',
                message: 'Enter controller name:',
                validate: function (value) {
                    if (!value || value.trim() === '') {
                        return 'Controller name is required';
                    }
                    return true;
                },
                filter: function (value) {
                    return value.charAt(0).toUpperCase() + value.slice(1);
                }
            },
            {
                type: 'input',
                name: 'namespace',
                message: 'Enter base namespace:',
                default: detectedNamespace
            },
            {
                type: 'input',
                name: 'outputPath',
                message: 'Enter output path:',
                default: controllerPathOutput
            }
        ],
        actions: function (data) {
            const roles = ['Admin', 'User'];
            return generateControllerFiles(data.name, data.namespace, roles, data.outputPath, templatesPath);
        }
    });

    plop.setGenerator('preset-crud-complete', {
        description: 'Quick: Generate with all CRUD roles (Admin,User,Manager,SuperAdmin,Guest,Moderator)',
        prompts: [
            {
                type: 'input',
                name: 'controllers',
                message: 'Enter controller names (comma separated):',
                validate: function (value) {
                    if (!value || (typeof value === 'string' && value.trim() === '')) {
                        return 'At least one controller name is required';
                    }
                    return true;
                },
                filter: function (value) {
                    // Ensure value is a string
                    if (typeof value !== 'string') {
                        value = String(value);
                    }
                    
                    return value.split(',')
                        .map(name => {
                            if (typeof name !== 'string') {
                                name = String(name);
                            }
                            return name.trim();
                        })
                        .filter(name => name !== '')
                        .map(name => name.charAt(0).toUpperCase() + name.slice(1));
                }
            },
            {
                type: 'input',
                name: 'namespace',
                message: 'Enter base namespace:',
                default: detectedNamespace
            },
            {
                type: 'input',
                name: 'outputPath',
                message: 'Enter output path:',
                default: controllerPathOutput
            }
        ],
        actions: function (data) {
            const roles = ['Admin', 'User', 'Manager', 'SuperAdmin', 'Guest', 'Moderator'];
            const allActions = [];
            
            // Ensure controllers is an array
            let controllers = data.controllers;
            if (!Array.isArray(controllers)) {
                controllers = [controllers];
            }
            
            controllers.forEach(controllerName => {
                const actions = generateControllerFiles(controllerName, data.namespace, roles, data.outputPath, templatesPath);
                allActions.push(...actions);
            });

            return allActions;
        }
    });
}