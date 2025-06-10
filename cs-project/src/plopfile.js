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

export default function (plop) {
    const detectedNamespace = detectNamespace();
    const templatesPath = getTemplatesPath();
    
    // Set template directory
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
            const actions = [];
            const pluralName = pluralize(data.name);

            // Generate files for each role
            data.roles.forEach(role => {
                actions.push(
                    {
                        type: 'add',
                        path: `{{outputPath}}/${pluralName}/${role}/${pluralName}Controller.cs`,
                        templateFile: path.join(templatesPath, 'controller.hbs'),
                        data: { 
                            type: role,
                            pluralName: pluralName,
                            singularName: data.name,
                            namespace: data.namespace
                        }
                    },
                    {
                        type: 'add',
                        path: `{{outputPath}}/${pluralName}/${role}/${pluralName}DTO.cs`,
                        templateFile: path.join(templatesPath, 'dto.hbs'),
                        data: { 
                            type: role,
                            pluralName: pluralName,
                            singularName: data.name,
                            namespace: data.namespace
                        }
                    },
                    {
                        type: 'add',
                        path: `{{outputPath}}/${pluralName}/${role}/${pluralName}Service.cs`,
                        templateFile: path.join(templatesPath, 'service.hbs'),
                        data: { 
                            type: role,
                            pluralName: pluralName,
                            singularName: data.name,
                            namespace: data.namespace
                        }
                    },
                    {
                        type: 'add',
                        path: `{{outputPath}}/${pluralName}/${role}/${pluralName}Template.cs`,
                        templateFile: path.join(templatesPath, 'template.hbs'),
                        data: { 
                            type: role,
                            pluralName: pluralName,
                            singularName: data.name,
                            namespace: data.namespace
                        }
                    }
                );
            });

            return actions;
        }
    });

    // Quick presets with namespace detection
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
            const actions = [];
            const pluralName = pluralize(data.name);

            roles.forEach(role => {
                actions.push(
                    {
                        type: 'add',
                        path: `{{outputPath}}/${pluralName}/${role}/${pluralName}Controller.cs`,
                        templateFile: path.join(templatesPath, 'controller.hbs'),
                        data: { 
                            type: role,
                            pluralName: pluralName,
                            singularName: data.name,
                            namespace: data.namespace
                        }
                    },
                    {
                        type: 'add',
                        path: `{{outputPath}}/${pluralName}/${role}/${pluralName}DTO.cs`,
                        templateFile: path.join(templatesPath, 'dto.hbs'),
                        data: { 
                            type: role,
                            pluralName: pluralName,
                            singularName: data.name,
                            namespace: data.namespace
                        }
                    },
                    {
                        type: 'add',
                        path: `{{outputPath}}/${pluralName}/${role}/${pluralName}Service.cs`,
                        templateFile: path.join(templatesPath, 'service.hbs'),
                        data: { 
                            type: role,
                            pluralName: pluralName,
                            singularName: data.name,
                            namespace: data.namespace
                        }
                    },
                    {
                        type: 'add',
                        path: `{{outputPath}}/${pluralName}/${role}/${pluralName}Template.cs`,
                        templateFile: path.join(templatesPath, 'template.hbs'),
                        data: { 
                            type: role,
                            pluralName: pluralName,
                            singularName: data.name,
                            namespace: data.namespace
                        }
                    }
                );
            });

            return actions;
        }
    });
}