///////Modeller///////////////
class Personal {
    constructor(id, namn, epost, roll) {
        this.id = id;
        this.namn = namn;
        this.epost = epost;
        this.roll = roll;
    }
}

class CrudPersonal {
    constructor() {
        this.lista = [
            new Personal(1, "Stina Larsson", "stina@du.se", "Chef"),
            new Personal(2, "Anna Nilsson", "anna@du.se", "HR-partner")
        ];
    }

    allPersonal() {
        return this.lista;
    }

    laggTill(person) {
        this.lista.push(person);
    }

    taBort(id) {
        this.lista = this.lista.filter(p => p.id !== id);
    }

    hitta(id) {
        return this.lista.find(p => p.id === id);
    }

    uppdatera(id, data) {
        const person = this.hitta(id);
        if (person) {
            Object.assign(person, data);//data kommer in som json obker i form av {}
        }
    }
}
/////vyn
class PersonalView {
    constructor() {
        this.template = Handlebars.compile(document.getElementById("personal-template").innerHTML);
        this.container = document.getElementById("personalLista");

        this.initEventListeners();
    }

    render(personalLista) {
        this.container.innerHTML = this.template({ personal: personalLista });
    }

    initEventListeners() {
        document.getElementById("addForm").addEventListener("submit", (e) => {
            e.preventDefault();
            const person = {
                id: parseInt(document.getElementById("id").value),
                namn: document.getElementById("namn").value.trim(),
                epost: document.getElementById("epost").value.trim(),
                roll: document.getElementById("roll").value.trim()
            };
            document.dispatchEvent(new CustomEvent("personalAdded", { detail: person }));
            e.target.reset();
        });

        document.getElementById("uppdateraForm").addEventListener("submit", (e) => {
            e.preventDefault();
            const updated = {
                id: parseInt(document.getElementById("uppdateraId").value),
                namn: document.getElementById("uppdateraNamn").value.trim(),
                epost: document.getElementById("uppdateraEpost").value.trim(),
                roll: document.getElementById("uppdateraRoll").value.trim()
            };
            document.dispatchEvent(new CustomEvent("personalUpdated", { detail: updated }));
            e.target.reset();
            
            // Stäng modalen
            bootstrap.Modal.getInstance(document.getElementById("modalUppdateraPersonal")).hide();

        });

        this.container.addEventListener("click", (e) => {
            const id = parseInt(e.target.dataset.id);
            if (e.target.classList.contains("btn-delete")) {
                document.dispatchEvent(new CustomEvent("personalDeleted", { detail: id }));
            }
            if (e.target.classList.contains("btn-edit")) {
                document.dispatchEvent(new CustomEvent("personalEdited", { detail: id }));
            }
        });
    }

    fyllUppdateraForm(person) {
        document.getElementById("uppdateraId").value = person.id;
        document.getElementById("uppdateraNamn").value = person.namn;
        document.getElementById("uppdateraEpost").value = person.epost;
        document.getElementById("uppdateraRoll").value = person.roll;
    }
}
////kontroller/////////////////////
class PersonalController {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        this.initEventListeners();
        this.view.render(this.model.allPersonal());
    }

    initEventListeners() {
        //lyssnar på custom events från vyn
        document.addEventListener("personalAdded", (e) => {
            const data = e.detail;
            this.model.laggTill(new Personal(data.id, data.namn, data.epost, data.roll));
            this.view.render(this.model.allPersonal());
        });

        document.addEventListener("personalDeleted", (e) => {
            this.model.taBort(e.detail);
            this.view.render(this.model.allPersonal());
        });

        document.addEventListener("personalEdited", (e) => {
            const person = this.model.hitta(e.detail);
            if (person){
                this.view.fyllUppdateraForm(person);

            } 
        });

        document.addEventListener("personalUpdated", (e) => {
            const { id, namn, epost, roll } = e.detail;
            this.model.uppdatera(id, { namn, epost, roll });
            this.view.render(this.model.allPersonal());
        });
    }
}
class App {
  static main() {
    document.addEventListener("DOMContentLoaded", () => {
      const model = new CrudPersonal();
      const view = new PersonalView();
      new PersonalController(model, view);
    });
  }
}

// Anropa den statiska metoden direkt via klassen utan att
//behöva instansiera ett objekt ur klassen
App.main();





