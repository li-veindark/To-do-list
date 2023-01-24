//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


// mongoose required lines
mongoose.set('strictQuery', true);
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://prathamGoel:pratham123@cluster0.wgktfxg.mongodb.net/todolistDB');
}

const itemsSchema = new mongoose.Schema({
  name: String
});

const item = mongoose.model("item", itemsSchema);

const item1 = new item({ name: "Welcome to the website!" });
const item2 = new item({ name: "Press '+' to add any item." });
const item3 = new item({ name: "Press this to delete any item." });

const defaultItems = [item1, item2, item3];

const ListSchema = new mongoose.Schema({
  name: String,
  Items: [itemsSchema]
});

const list = mongoose.model("listItem", ListSchema);



app.get("/", function (req, res) {

  item.find(({}), function (err, foundItems) {


    if (foundItems.length === 0) {

      item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Uploded!");
        }

        res.redirect("/");
      });

    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }

  });
});



app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const CustomListTitle = req.body.list;

  const Addeditem = new item({
    name: itemName
  });


  if (CustomListTitle === "Today") {
    Addeditem.save();
    res.redirect("/");
  } else {

    list.findOne({ name: CustomListTitle }, function (err, foundList) {

      foundList.Items.push(Addeditem);
      foundList.save();
      res.redirect("/" + CustomListTitle);

    });
  }
});



app.post("/delete", function (req, res) {
  const CheckedItem = req.body.checkbox;
  const ListName = req.body.listname;


  if (ListName === "Today") {

    item.findByIdAndRemove(CheckedItem, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Deleted that item.")
      }

      res.redirect("/");

    });
  } else {

    list.findOneAndUpdate(

      { name: ListName },
      { $pull: { Items: { _id: CheckedItem } } },
        function(err, foundList){
          if (!err){
            res.redirect("/" + ListName);
          }
        }
      );
  }
});


app.get("/:param", function (req, res) {

  const customlistName = _.capitalize(req.params.param);

  list.findOne({ name: customlistName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {

        const listItem = new list({
          name: customlistName,
          Items: defaultItems
        });

        listItem.save();
        res.redirect("/" + customlistName);

      } else {

        res.render("list", { listTitle: foundList.name, newListItems: foundList.Items });



      }
    }

  });

});



app.get("/about", function (req, res) {
  res.render("about");
});



app.listen(3000, function () {
  console.log("Server started on port 3000");
});
