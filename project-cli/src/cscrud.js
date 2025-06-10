const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create an interface to receive input from the keyboard
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});


const roles = [
    "Admin",
    // "Manage",
    "User",
    "Shared"

]
// Function to create a folder and files with a given refix
function createFilesWithRefix(refix) {
    if (!refix) {
        return
    }
    // Path of the folder to be created
    let folderPath = path.join('.');
    // folderPath = path.join(folderPath, 'CRDUTemplate');

    // Create the folder if it does not exist
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        console.log(`Folder "${folderPath}" has been created.`);
    } else {
        console.log(`Folder "${folderPath}" already exists.`);
    }

    const controllerText = `using ATM.Auth.RequirementStructures.Policies;
using ATM.Common;
using ATM.v3.Api.Controllers.Core;
using ATM.v3.Api.TemplateModel;
using Dino.ApiCore.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ATM.v3.Api.Controllers.@role@
{
    [AuthorizedJWT(Policy = AuthorizeManage.Policy@role@)]
    [@role@Route]
    [InitialActionFilter]
    public class ${refix}Controller : ${refix}Config.CRUDControllerBase
    {
        public ${refix}Controller(${refix}Config.ICRUDService cRUDServiceBase) : base(cRUDServiceBase) { }
    }
}
`

    const ServiceText = `using ATM.DbContexts.Domain.TrackEntities;
using ATM.DbContexts.TrackMusic;
using ATM.v3.Api.TemplateModel;
using Dino.ApiCore.Accessors;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace ATM.v3.Api.Services.CRUDs
{
    public class ${refix}ServiceGeneral
    {
        public ${refix}ServiceGeneral()
        {
        }
        public Expression<Func<${refix}, ${refix}Template.View>> ExtendSelector()
        {
            return x => new ${refix}Template.View
            {
            };
        }
    }
    public class Admin${refix}Service : ${refix}Config.CRUDServiceBase
    {
        private readonly ${refix}ServiceGeneral _general;
        public Admin${refix}Service(TrackMusicDbContext dbContext,
            IOptions<${refix}ServiceGeneral> options) : base(dbContext)
        {
            _general = options.Value;
        }
     
        public override Expression<Func<${refix}, ${refix}Template.View>> ExtendSelector()
        {
            return _general.ExtendSelector();
        }
    }
    public class Manage${refix}FilterService : Manage${refix}Config.CRUDAndFilterServiceBase
    {
        private readonly ${refix}ServiceGeneral _general;

        public Manage${refix}FilterService(TrackMusicDbContext dbContext, InitialAccessor initialAccessor) : base(dbContext, initialAccessor)
        {
            _general = new ${refix}ServiceGeneral();
        }
        public override Task OnRequestInitial(InitialContext context)
        {
            _Sources = _dbContext.Set<${refix}>()
                .Where(x => x.User.UserCreatorId == _accessor.UserId);
            return Task.CompletedTask;
        }
        public override ${refix} BeforeCreate(${refix} source, ${refix}Template.Create create)
        {
            return base.BeforeCreate(source, create);
        }
        public override Expression<Func<${refix}, ${refix}Template.View>> ExtendSelector()
        {
            return _general.ExtendSelector();
        }
    }
    public class User${refix}FilterService : User${refix}Config.CRUDAndFilterServiceBase
    {
        private readonly ${refix}ServiceGeneral _general;

        public User${refix}FilterService(TrackMusicDbContext dbContext, InitialAccessor initialAccessor) : base(dbContext, initialAccessor)
        {
            _general = new ${refix}ServiceGeneral();
        }
        public override Task OnRequestInitial(InitialContext context)
        {
            _Sources = _dbContext.Set<${refix}>().Where(x => x.UserId == _accessor.UserId);
            return Task.CompletedTask;
        }
        public override ${refix} BeforeCreate(${refix} source, ${refix}Template.UserCreate create)
        {
            source.UserId = _accessor.UserId;
            return base.BeforeCreate(source, create);
        }
        public override Expression<Func<${refix}, ${refix}Template.View>> ExtendSelector()
        {
            return _general.ExtendSelector();
        }
    }
}
`
    const TemplateText = `using ATM.DbContexts.Domain.TrackEntities;
using Dino.ApiCore.Common;
using Dino.Common.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ATM.v3.Api.TemplateModel
{
    public class ${refix}Template : CRUDBase
    {
        public class View : View<${refix}>
        {
        }
        public class UserCreate : Create<${refix}>
        {
        }
        public class Create : UserCreate
        {
        }
        public class Edit : Edit<${refix}>
        {
        }
        public class Key : Key<${refix}>
        {
        }
        public class ManageKey : Key<${refix}>
        {
        }
        public class UserKey : Key<${refix}>
        {
        }
    }
    public class ${refix}Config : TemplateConfig<${refix}, ${refix}Template.View, ${refix}Template.Create, ${refix}Template.Edit, ${refix}Template.Key>
    {
    }
    public class Manage${refix}Config : TemplateConfig<${refix}, ${refix}Template.View, ${refix}Template.Create, ${refix}Template.Edit, ${refix}Template.ManageKey>
    {
    }
    public class User${refix}Config : TemplateConfig<${refix}, ${refix}Template.View, ${refix}Template.UserCreate, ${refix}Template.Edit, ${refix}Template.UserKey>
    {
    }
}
`
    // List of file paths to be created
    const files = [
        ...(roles.map(role => (
            { Path: path.join(folderPath, `Controllers/${role ?? "Admin"}/${refix}Controller.cs`), Content: controllerText.replaceAll(/@role@/g, role) }
        ))),
        { Path: path.join(folderPath, `Services/CRUDs/${refix}Service.cs`), Content: ServiceText },
        { Path: path.join(folderPath, `TemplateModel/${refix}Template.cs`), Content: TemplateText },
    ];

    // Create each file and write a sample content
    files.forEach((item, index) => {
        const dirPath = path.dirname(item.Path); // Get the directory path
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true }); // Create directories if they don't exist
            console.log(`Directory "${dirPath}" has been created.`);
        }
        if (fs.existsSync(item.Path)) {
        } else {
            // Create the file with sample content
            fs.writeFileSync(item.Path, item.Content);
            console.log(`File ${index + 1}: "${item.Path}" has been created.`);
        }

    });
}

// Prompt the user to input a refix
rl.question('Enter a refix for the .cs files: ', (refix) => {
    createFilesWithRefix(refix.trim()); // Call the function with both inputs
    rl.close(); // Close the input interface
});
