//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const ejs = require('ejs');
const expressLayouts = require('express-ejs-layouts');
const _ = require('lodash');

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true})
.then(conn =>console.log("sucesso"))
.catch(err => console.log("Bad connection"));


const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Comprar comida"
});

const item2 = new Item ({
  name: "Passear com cachorro"
});

const item3 = new Item ({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

// async function findNameItems(){
// const items = Item.find({}, 'name');
// console.log(items);
//};



app.get("/", function(req, res) {
//Novo modo de usar o modelo.find - o código if (callback fica dentro do .then)
  Item.find({})
    .then((foundItems) => {
      if (foundItems.length === 0){
         Item.insertMany(defaultItems).then(function(){
           console.log("Sucesso inserção default");
         }).catch(function(err){
           console.log(err);
         });
         res.redirect("/");
       }else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
       }
    })
      .catch(err => {
        //res.status(500).json(err);


        console.log(err);
      })
//res.render("List", {listTitle:"Today", newListItems: defaultItems});


// Item.find({}, function(err, foundItems){
//   if (foundItems.length === 0){
//     Item.insertMany(defaultItems).then(function(){
//       console.log("Sucesso");
//     }).catch(function(err){
//       console.log(err);
//     });
//     res.redirect("/");
//   }else{
//       res.render("list", {listTitle: "Today", newListItems: items});
//   }
//
// });



});
//findNameItems();
// app.post("/", function(req, res){
  app.post("/", async (req, res) =>{
  const itemName = req.body.newItem;
  const listaNome = req.body.list;
  const item =  new Item({name:itemName});
 console.log (item);
//Nova rotina para capturar o item e enviar para a lista correta
if(listaNome === "Today"){
  item.save();
  res.redirect("/");
} else {
  List.findOne({name: listaNome})
  .then(foundList => {
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+ listaNome);
  });
  };

//Antigo teste
  // try {
  //   await defaultItems.push(items);
  //   items.save();
  //   res.redirect("/");
  //   console.log("Item Salvo", defaultItems);
  // } catch(err){
  //   console.log("Não salvo", err);
  // }


  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   defaultItems.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", function(req, res){
  let itemDelete = req.body.checkbox;
  let listaNome = req.body.listaNome;

if (listaNome === "Today"){
  Item.findByIdAndDelete(itemDelete)
      .then(deleteDoc => {
        if (deleteDoc === null){
          console.log("Nenhum documento encontrado com essa ID");

        }else {
          console.log("Registro apagado com sucesso");
        }res.redirect("/");
      })
} else  {
        const updateThisShit = async(req, res) =>{
        // try {
        const filter = List.findOne({name: listaNome});
        console.log("Você está na lista: "+listaNome);
        const updateItem={$pull:{items:{_id:itemDelete}}};
        console.log(updateItem);
        const saveUpdate = {new: true};

        let safeDelete = await List.findOneAndUpdate(filter, updateItem,{new:true});
        console.log("Guud");
      // } catch(error){
      //   res.redirect("/"+listaNome);
      //   res.send({error});
      //   console.log(error);
      // }

    }
    updateThisShit();
    res.redirect("/"+listaNome);

//     const updateItem = async(req, res) =>{
//       const filter= await List.findOne({name: listaNome});
//       console.log(listaNome);
//       const update={$pull:{items:{_id:itemDelete}}};
//       try {
//     return await List.findOneAndUpdate(filter, update,{new:true});
//   return updateItem || 'not found';
//   console.log(update);
//   res.redirect("/"+ listaNome);
// } catch (error){
//   return error.message;
// };
// };

//   Item.findByIdAndDelete({})
//   .then ((itemDelete) =>{
//     console.log("Removido", docs);
//
// }).catch(err =>{
//   console.log(err);
// }

};

});

app.get("/:listaTitulo", (req, res)=>{
  let listaTitulo = _.capitalize(req.params.listaTitulo);

//const list = mongoose.model("List", itemsSchema);
List.findOne({name: listaTitulo})
  .then((foundList) => {
    if (!foundList){
      //cria nova lista
      const list = new List ({
        name: listaTitulo,
        items: defaultItems
      });
      console.log("doesn't exists");
      list.save();
      res.redirect("/" + listaTitulo );
     }else{
       console.log("already exists");
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
     }
  })
    // .catch(err => {
    //   //res.status(500).json(err);
    //
    //
    //   console.log(err);
    // })

});

app.get("/about", function(req, res){
  res.render("about");
});



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
//};
