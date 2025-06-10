const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create an interface to receive input from the keyboard
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
function addPlural(word) {
    if (word.endsWith('s') || word.endsWith('x') || word.endsWith('z') || word.endsWith('sh') || word.endsWith('ch')) {
        return word + "es";
    } else if (word.endsWith('y') && !isVowel(word[word.length - 2])) {
        return word.slice(0, -1) + "ies";
    } else {
        return word + "s";
    }
}

function isVowel(char) {
    return ['a', 'e', 'i', 'o', 'u'].includes(char.toLowerCase());
}


const roles = [
    "Admin",
    "User",
    "Guest",
]
// Function to create a folder and files with a given refix
function createFilesWithRefix(refix) {
    if (!refix) {
        return
    }

    refixPlural = addPlural(refix)
    // Path of the folder to be created
    let folderPath = path.join('.');
    // folderPath = path.join(folderPath, 'TestCRDUTemplate');

    // Create the folder if it does not exist
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        console.log(`Folder "${folderPath}" has been created.`);
    } else {
        console.log(`Folder "${folderPath}" already exists.`);
    }

    const controllerText = `using Dino.ApiCore.Routes;
using Dinocollab.Common.Helper;
using Dinocollab.MediaStore.Api.Attributes;
using Dinocollab.MediaStore.Api.CRUDTemplates;
using Dinocollab.MediaStore.Api.CRUDTemplates.DTOs;
using Dinocollab.MediaStore.Api.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Dinocollab.MediaStore.Api.Controllers.${refixPlural}.@role@
{
    [ISV4@role@AuthorizedJWT]
    [@role@Route]
    public class ${refixPlural}Controller : ${refixPlural}Template.CRUDControllerBase
    {
        public ${refixPlural}Controller(I${refixPlural}Service service) : base(service)
        {
        }
    }
}
`

    const ServiceText = `using Dinocollab.MediaStore.Api.CRUDTemplates;
using Dinocollab.MediaStore.Api.Interfaces;
using Microsoft.EntityFrameworkCore;
using Dinocollab.MediaStore.Api.Attributes;


namespace Dinocollab.MediaStore.Api.Controllers.${refixPlural}.@role@
{
    public interface I${refixPlural}Service : ${refixPlural}Template.ICRUDService
    {
    }
    [CRUDTemplate]
    public class ${refixPlural}Service : ${refixPlural}Template.CRUDServiceBase, I${refixPlural}Service
    {
        public ${refixPlural}Service(DbContext dbContext) : base(dbContext)
        {
        }
    }
}
`
    const DTOText = `using Dino.Common.Models;
using Dinocollab.MediaStore.Data.Entities;
using System.ComponentModel.DataAnnotations;
using static Dino.Common.Models.CRUDBase;

namespace Dinocollab.MediaStore.Api.Controllers.${refixPlural}.@role@
{
    public class ${refixPlural}@role@DTO : CRUDBase
    {
        public class View : View<${refix}>
        {
            public Guid Id { get; set; }
        }

        public class Create : Create<${refix}> { }
        public class UserCreate : Create<${refix}>
        {
        }

        public class Edit : Edit<${refix}>
        {
        }
        public class Key : Key<${refix}>
        {
            public Guid Id { get; set; }
        }
    }
}

`
    const TemplateText = `using Dino.ApiCore.Common;
namespace Dinocollab.MediaStore.Api.Controllers.${refixPlural}.@role@;
public class ${refixPlural}Template : TemplateConfig<${refix}, ${refixPlural}@role@DTO.View, ${refixPlural}@role@DTO.Create, ${refixPlural}@role@DTO.Edit, ${refixPlural}@role@DTO.Key>
{
}
`
    // List of file paths to be created
    const files = [];
    roles.map(role => [
        { Path: path.join(folderPath, `Controllers/${refixPlural}/${role ?? "Admin"}/${refixPlural}Controller.cs`), Content: controllerText.replaceAll(/@role@/g, role) },
        { Path: path.join(folderPath, `Controllers/${refixPlural}/${role ?? "Admin"}/${refixPlural}Service.cs`), Content: ServiceText .replaceAll(/@role@/g, role)},
        { Path: path.join(folderPath, `Controllers/${refixPlural}/${role ?? "Admin"}/${refixPlural}DTO.cs`), Content: DTOText.replaceAll(/@role@/g, role) },
        { Path: path.join(folderPath, `Controllers/${refixPlural}/${role ?? "Admin"}/${refixPlural}Template.cs`), Content: TemplateText .replaceAll(/@role@/g, role)},
    ]).forEach(item => files.push(...item))

    // Create each file and write a sample content
    files.forEach((item, index) => {
        const dirPath = path.dirname(item.Path); // Get the directory path
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true }); // Create directories if they don't exist
            console.log(`Directory "${dirPath}" has been created.`);
        }
        if (fs.existsSync(item.Path)) {
            throw new Error(item.Path + " is already exist.")
        }
        // Create the file with sample content
        fs.writeFileSync(item.Path, item.Content);
        console.log(`File ${index + 1}: "${item.Path}" has been created.`);
    });
}

// Prompt the user to input a refix
rl.question('Enter a refix for the .cs files: ', (refix) => {
    createFilesWithRefix(refix.trim()); // Call the function with both inputs
    rl.close(); // Close the input interface
});
