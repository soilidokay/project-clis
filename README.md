# Project CLIs Collection 🛠️

A comprehensive collection of CLI tools for various development tasks including C# controller generation, React components, Redux modules, and TypeScript libraries.

## 📦 Projects Overview

This workspace contains multiple CLI tools organized in separate folders:

### 🦕 [cs-project](./cs-project/README.md) - DinoCSharp
**C# Controller Generator CLI**
- Generate complete C# Controller structures with CRUD operations
- Support for multiple roles (Admin, User, etc.)
- Auto-generate DTOs, Services, and Templates
- Batch generation from JSON config files

```bash
cd cs-project
npm install -g dinocsharp
dinocsharp
```

### ⚡ [project-cli](./project-cli/) - Development Tools Collection
**Multiple CLI utilities for rapid development**

#### Available Commands:
- `pi lib [name]` - Generate TypeScript library
- `pi react [name]` - Generate React TypeScript component library  
- `pi reactlib [name]` - Generate React library with Rollup
- `pi reduxbase [name]` - Generate Redux base module
- `pi tableredux [name]` - Generate Redux table module
- `pi cscrud [name]` - Generate C# CRUD files (legacy)
- `pi cscrud2 [name]` - Generate C# CRUD files (v2)

#### Setup:
```bash
cd project-cli
# Run as Administrator
setup.bat
# Then use globally:
pi lib MyLibrary
pi react MyComponent
```

## 🚀 Quick Start

### Option 1: Use DinoCSharp for C# Development
```bash
# Install globally
npm install -g dinocsharp

# Generate C# controllers
dinocsharp

# Or batch generation
dinocsharp --multiple
```

### Option 2: Use Project CLI for Multi-purpose Development
```bash
# Navigate to project-cli folder
cd project-cli

# Run setup as Administrator
setup.bat

# Use various generators
pi lib MyTypeScriptLib
pi react MyReactComponent
pi reduxbase MyReduxModule
```

## 📁 Folder Structure

```
project-clis/
├── cs-project/           # DinoCSharp - C# Controller Generator
│   ├── src/             # Source code
│   ├── templates/       # Handlebars templates
│   ├── Controllers/     # Generated output example
│   └── README.md        # Detailed documentation
├── project-cli/         # Multi-purpose CLI tools
│   ├── src/            # CLI scripts
│   ├── bin/            # Executable files
│   └── setup.bat       # Windows setup script
└── README.md           # This file
```

## 🔧 Features Comparison

| Feature | DinoCSharp | Project CLI |
|---------|------------|-------------|
| C# Controllers | ✅ Advanced | ✅ Basic |
| React Components | ❌ | ✅ |
| TypeScript Libraries | ❌ | ✅ |
| Redux Modules | ❌ | ✅ |
| Batch Generation | ✅ | ❌ |
| Template System | ✅ Handlebars | ✅ String Templates |
| Cross-platform | ✅ | ⚠️ Windows Only |

## 📚 Documentation

### Detailed Documentation:
- **[DinoCSharp Documentation](./cs-project/README.md)** - Complete guide for C# controller generation
- **[Project CLI Scripts](./project-cli/src/)** - Individual script documentation

### Quick Reference:
- **C# Development**: Use [DinoCSharp](./cs-project/README.md) for modern, feature-rich controller generation
- **React Development**: Use `pi react` or `pi reactlib` from [project-cli](./project-cli/)
- **TypeScript Libraries**: Use `pi lib` from [project-cli](./project-cli/)
- **Redux Modules**: Use `pi reduxbase` or `pi tableredux` from [project-cli](./project-cli/)

## 🛠️ Development Setup

### Prerequisites
- Node.js >= 16.0.0
- npm or pnpm
- Windows (for project-cli setup)

### Setup Instructions

1. **Clone the repository**
```bash
git clone <repository-url>
cd project-clis
```

2. **Setup DinoCSharp**
```bash
cd cs-project
pnpm install
npm run build
npm link  # For global usage
```

3. **Setup Project CLI**
```bash
cd ../project-cli
# Run as Administrator
setup.bat
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Examples

### Generate C# API Controllers
```bash
# Interactive mode
dinocsharp

# Follow prompts:
# ? Controller name: Product
# ? Namespace: MyShop.API
# ? Select roles: Admin, User
```

### Generate React Component Library
```bash
# Generate React component with TypeScript
pi react MyButton

# This creates a complete library with:
# - TypeScript configuration
# - Rollup bundling
# - React components
# - Build scripts
```

### Generate TypeScript Library
```bash
# Generate TypeScript library
pi lib MyUtilities

# Creates:
# - TypeScript project
# - Build configuration
# - Sample functions
# - Package.json
```

## 📄 License

This project is licensed under the MIT License - see the individual [LICENSE](./cs-project/LICENSE) files for details.

## ⭐ Support

If you find these tools helpful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting issues
- 💡 Suggesting new features
- 🤝 Contributing code

---

**Happy Coding! 🚀**