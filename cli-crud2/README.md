# DinoCSharp 🦕

[![npm version](https://badge.fury.io/js/dinocsharp.svg)](https://badge.fury.io/js/dinocsharp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful CLI tool to generate C# Controller structures with CRUD operations, DTOs, Services, and Templates using Plop.js.

## Features

- 🚀 Generate complete C# Controller structure
- 📁 Support for multiple roles (Admin, User)
- 🎯 Customizable namespaces and output paths
- 📄 Auto-generate DTOs, Services, and Templates
- 🔧 Batch generation from JSON config
- 💼 TypeScript support
- 🎨 Beautiful CLI interface with Chalk

## Installation

### Global Installation
```bash
npm install -g dinocsharp
```

### Local Installation
```bash
npm install dinocsharp
```

## Usage

### Interactive Mode
```bash
dinocsharp
```

### Batch Mode with Config File
```bash
dinocsharp --multiple
```

## Configuration

Create a `controllers-config.json` file:

```json
{
  "namespace": "YourApp.API",
  "outputPath": "./Controllers",
  "defaultRoles": ["Admin", "User"],
  "controllers": [
    {
      "name": "Product",
      "roles": ["Admin", "User"]
    },
    {
      "name": "Category",
      "roles": ["Admin"]
    }
  ]
}
```

## Generated Structure

```
Controllers/
├── Products/
│   ├── Admin/
│   │   ├── ProductsController.cs
│   │   ├── ProductsDTO.cs
│   │   ├── ProductsService.cs
│   │   └── ProductsTemplate.cs
│   └── User/
│       ├── ProductsController.cs
│       ├── ProductsDTO.cs
│       ├── ProductsService.cs
│       └── ProductsTemplate.cs
```

## Templates

The CLI generates the following files for each controller:

- **Controller**: API endpoints with CRUD operations
- **DTO**: Data Transfer Objects for View, Create, Edit, Key
- **Service**: Business logic layer
- **Template**: Configuration template

## Available Generators

1. **single-controller**: Generate a single controller with roles
2. **batch-controller**: Generate multiple controllers from config file
3. **preset-admin-user**: Quick preset for Admin and User roles

## Examples

### Single Controller Generation
```bash
# Run interactive mode
dinocsharp

# Follow the prompts:
# ? Controller name: Product
# ? Namespace: MyShop.API
# ? Output path: ./Controllers
# ? Select roles: Admin, User
```

**Generated files:**
```
Controllers/
├── Products/
│   ├── Admin/
│   │   ├── ProductsController.cs
│   │   ├── ProductsDTO.cs
│   │   ├── ProductsService.cs
│   │   └── ProductsTemplate.cs
│   └── User/
│       ├── ProductsController.cs
│       ├── ProductsDTO.cs
│       ├── ProductsService.cs
│       └── ProductsTemplate.cs
```

### Batch Generation with Config File

Create `controllers-config.json`:
```json
{
  "namespace": "ECommerce.API",
  "outputPath": "./src/Controllers",
  "defaultRoles": ["Admin", "User", "Manager"],
  "controllers": [
    {
      "name": "Product",
      "roles": ["Admin", "User", "Manager"]
    },
    {
      "name": "Category", 
      "roles": ["Admin", "Manager"]
    },
    {
      "name": "Order",
      "roles": ["Admin", "User"]
    },
    {
      "name": "User",
      "roles": ["Admin"]
    }
  ]
}
```

Run batch generation:
```bash
dinocsharp --multiple
```

**Generated structure:**
```
src/Controllers/
├── Products/
│   ├── Admin/
│   │   ├── ProductsController.cs
│   │   ├── ProductsDTO.cs
│   │   ├── ProductsService.cs
│   │   └── ProductsTemplate.cs
│   ├── User/
│   │   └── [same files...]
│   └── Manager/
│       └── [same files...]
├── Categories/
│   ├── Admin/
│   │   └── [same files...]
│   └── Manager/
│       └── [same files...]
├── Orders/
│   ├── Admin/
│   │   └── [same files...]
│   └── User/
│       └── [same files...]
└── Users/
    └── Admin/
        └── [same files...]
```

### Generated Code Examples

#### Controller Example
```csharp
// ProductsController.cs (Admin role)
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace ECommerce.API.Controllers.Products.Admin
{
    [ApiController]
    [Route("api/admin/products")]
    [Authorize(Roles = "Admin")]
    public class ProductsController : ControllerBase
    {
        private readonly ProductsService _service;

        public ProductsController(ProductsService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductViewDTO>>> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductViewDTO>> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);
            return result != null ? Ok(result) : NotFound();
        }

        [HttpPost]
        public async Task<ActionResult<ProductViewDTO>> Create([FromBody] ProductCreateDTO dto)
        {
            var result = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ProductViewDTO>> Update(int id, [FromBody] ProductEditDTO dto)
        {
            var result = await _service.UpdateAsync(id, dto);
            return result != null ? Ok(result) : NotFound();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var success = await _service.DeleteAsync(id);
            return success ? NoContent() : NotFound();
        }
    }
}
```

#### DTO Example
```csharp
// ProductsDTO.cs
namespace ECommerce.API.Controllers.Products.Admin
{
    public class ProductViewDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class ProductCreateDTO
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
    }

    public class ProductEditDTO
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
    }

    public class ProductKeyDTO
    {
        public int Id { get; set; }
    }
}
```

### Command Line Options

```bash
# Interactive mode (default)
dinocsharp

# Batch mode with default config file
dinocsharp --multiple

# Batch mode with custom config file
dinocsharp --multiple --config=./my-config.json

# Help
dinocsharp --help

# Version
dinocsharp --version
```

### Advanced Usage

#### Custom Namespace Structure
```json
{
  "namespace": "MyCompany.ProjectName.WebAPI",
  "outputPath": "./src/Areas/API/Controllers",
  "defaultRoles": ["SuperAdmin", "Admin", "User", "Guest"],
  "controllers": [
    {
      "name": "Product",
      "roles": ["SuperAdmin", "Admin", "User"]
    }
  ]
}
```

#### Role-Based Access Examples
```bash
# Generate controller for specific roles only
# When prompted, select only needed roles:
# ? Select roles: SuperAdmin, Admin (deselect User, Guest)
```

#### Integration with ASP.NET Core Project
```bash
# Navigate to your ASP.NET Core project
cd MyWebAPI

# Generate controllers in the correct location
dinocsharp
# ? Output path: ./Controllers
# ? Namespace: MyWebAPI.Controllers
```

### Tips & Best Practices

1. **Consistent Naming**: Use PascalCase for controller names (Product, UserProfile, OrderItem)

2. **Namespace Convention**: Follow your project's namespace structure
   ```json
   "namespace": "CompanyName.ProjectName.API"
   ```

3. **Role Management**: Plan your roles before generation
   ```json
   "defaultRoles": ["Admin", "Manager", "User", "Guest"]
   ```

4. **Output Structure**: Organize by feature
   ```
   Controllers/
   ├── Products/     # Product management
   ├── Orders/       # Order management  
   └── Users/        # User management
   ```

5. **Batch Processing**: Use config files for multiple controllers
   ```bash
   # Create controllers-config.json first, then:
   dinocsharp --multiple
   ```