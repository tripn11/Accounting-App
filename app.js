//Budget Controller
let budgetController = (function(){

    const Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calcPercentage = function (totalIncome) {
        if(totalIncome>0){
            this.percentage = Math.round((this.value/totalIncome)*100);
        }else{
            this.percentage = -1;
        }
    };
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    const Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    const data = {
        allItems:{
            inc:[],
            exp:[]
        },
        totals:{
            exp: 0,
            inc: 0
        },
        budget:0,
        percentage:-1
    }

    let calculateTotal = function(type) {
        let sum = 0;
        data.allItems[type].forEach(function(currObj) {
            sum+=currObj.value;
        });

        data.totals[type] = sum;
    }

    return{
        addItem: function(type, des, val){
        let newItem, ID;

        if(data.allItems[type].length > 0){
            ID = data.allItems[type][data.allItems[type].length-1].id + 1;
        }else{
            ID = 0; 
        }

        if(type ==='exp'){
            newItem = new Expense(ID, des, val);
        }else if(type==='inc'){
            newItem = new Income(ID, des, val);
        }

        data.allItems[type].push(newItem);

        return newItem;
        },

        deleteItem: function(type, id) {
            let mapped;
            mapped = data.allItems[type].map(function(element) {
                return element.id;
            });

            index = mapped.indexOf(id);

            if(index!==-1){
                data.allItems[type].splice(index, 1);
            }
            
        },

        calculateBudget: function () {
            calculateTotal('inc');
            calculateTotal('exp');

            data.budget = data.totals.inc - data.totals.exp;
            if(data.totals.inc>0){
                data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);
            }else{
                data.percentage = "--";
            }
            
        },

        getBudget: function() {
            return {
                budget:data.budget,
                totalInc:data.totals.inc,
                totalExp:data.totals.exp,
                percentage:data.percentage
            }
        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(function (current) {
                current.calcPercentage(data.totals.inc);
            })

        },

        getPercentages: function () {
            let allPercentages = data.allItems.exp.map(function(current) {
                return  current.getPercentage();
            });
            return allPercentages;
        },

        testing: function() {
            console.log(data);
        }
    }
})();





//UI controller
let UIController = (function(){
    
    let formatNumber = function (type, num) {
        let numSplit,int,dec;
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];
        if(int.length>3){
            int = int.substr(0,int.length-3) + "," + int.substr(int.length-3,int.length);
        };

        return (type === 'exp' ? '-':'+') + int + '.' + dec;//ternary operator:same as using if else statement
    };

    let nodeListForEach = function (list,callback){//creating our own for loop through a list is an alternative to Array.prototype.slice.call(desired node list to be converted to array
        for(let i = 0; i<list.length; i++){
            callback(list[i],i);
        }
    };

    return{
        getInput: function(){
            return {
            type: document.querySelector('.add-type').value,
            description: document.querySelector('.add-description').value,
            value:Number(document.querySelector('.add-value').value)
            };
        },

        addListItem: function(obj, type) {
            let html, newHtml, element;

            if (type==='inc'){
            element = ".income-list";

            html = '<div class="item" id="inc-%id%"><div class="item-description">%description%</div><div class="item-date"></div><div class="extra"><div class="item-value">%value%</div><div class="item-delete"><button class="button-delete"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(type=== 'exp'){
            element = ".expenses-list";
            
            html = '<div class="item" id="exp-%id%"><div class="item-description">%description%</div><div class="item-date"></div><div class="extra extra-expenses"><div class="item-value">%value%</div><div class="item-percentage">21%</div><div class="item-delete"><button class="button-delete"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%description%",obj.description);
            newHtml = newHtml.replace("%value%",formatNumber(type, obj.value));

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(itemID) {
            let item = document.getElementById(itemID);
            item.parentNode.removeChild(item);
        },

        clearFields: function() {
            let fields,fieldsArr;

            fields = document.querySelectorAll(".add-description, .add-value");
            fieldsArr = Array.prototype.slice.call(fields);//this is to create an array from the list of results provided by querySelectorAll

            fieldsArr.forEach(function(currElement,index, array) {//the forEach allows three parameters, the first is the current array element, the second is the index and the last is always the complete array.
                currElement.value = "";
            });

            fieldsArr[0].focus();//to bring the focus back to an input field for the user to continue inputing
        },

        displayBudget: function(obj) {
            if(obj.budget>0) {
                document.querySelector(".budget-value").textContent = formatNumber('inc', obj.budget);
            }else{
                let result = formatNumber('exp', obj.budget);
                result = result.substring(1);
                document.querySelector(".budget-value").textContent = result;
            };

            
            document.querySelector(".budget-income-value").textContent = formatNumber('inc', obj.totalInc);
            document.querySelector(".budget-expenses-value").textContent = formatNumber('exp', obj.totalExp);
            document.querySelector(".budget-expenses-percentage").textContent = obj.percentage + "%";
        },

        displayPercentages: function(percentages) {
            let percentageFields = document.querySelectorAll('.item-percentage');
            
            nodeListForEach(percentageFields,function(current, index) {
                if(percentages[index]>0){
                    current.textContent = percentages[index] + '%';
                }else{
                    current.textContent = '--';
                }
            });
        },
        
        displayMonth: function() {
            let now, year, month,months;
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            month = months[month];
            document.querySelector('.budget-title-month').textContent =month +', '+ year;
        },

        changedType: function() {
            let redFields;
            redFields = document.querySelectorAll('.add-type,.add-description,.add-value');
            nodeListForEach(redFields, function(curr){
                curr.classList.toggle('red-focus');
            });
            document.querySelector('.add-btn').classList.toggle('red');
        }
    }
})();





//Global App controller
let controller = (function(budgetCtrl, UICtrl) {
    let updatePercentages = function() {
        budgetCtrl.calculatePercentages();
        let percentages = budgetCtrl.getPercentages();
        UICtrl.displayPercentages(percentages);     
    }

    let updateBudget = function() {
        budgetCtrl.calculateBudget();
        let budget = budgetCtrl.getBudget();
        UICtrl.displayBudget(budget);
    }

    let controlDeleteItem = function(event) {
        let itemID,splitID,type,ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        splitID = itemID.split("-");
        type = splitID[0];
        ID = parseInt(splitID[1]);
        budgetCtrl.deleteItem(type, ID);
        UICtrl.deleteListItem(itemID);
        updateBudget();
        updatePercentages();
    }
   
    let ctrlAddItem = function(){
        let input, newItem;
        input = UICtrl.getInput();

        if(input.description !=="" && input.value!==0){
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        UICtrl.addListItem(newItem, input.type);
        UICtrl.clearFields();
        updateBudget();
        updatePercentages();
        }
    }

    let setupEventListeners = function() {
        document.querySelector(".add-btn").addEventListener("click", ctrlAddItem);
        document.addEventListener("keypress", function(event){
            if(event.key==="Enter"){
                ctrlAddItem();
            }
        });
        document.querySelector(".container").addEventListener("click", controlDeleteItem);
        document.querySelector(".add-type").addEventListener("change", UICtrl.changedType);
    }

    return {
        init: function() {
            UICtrl.displayMonth();
            setupEventListeners();
        }
    }
})(budgetController, UIController);

controller.init();