var budgetController=(function(){

// function constructor of Expense 
    var Expense = function(id,description,value)
    {
       this.id=id;
       this.description=description;
       this.value=value;
    };
    Expense.prototype.calcPercentages = function(totalIncome){
       if(totalIncome > 0)
       {
           this.percentage = math.round((this.value / totalIncome) * 100);
       }
       else{
           this.percentage = -1;
       }
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

     // function constructor of Income 

    var Income = function(id,description,value)
    {
       this.id=id;
       this.description=description;
       this.value=value;
    };

    // sum of either exp array or inc array
    var calculateTotal=function(type)
    {
        var sum = 0;
        data.allItems[type].forEach(function(cur)
        {
            sum=sum + cur.value;
        });
        data.totals[type]=sum;
    }
// data structure for income and expenses to store
    var data = {
        allItems:{
            exp:[],
            inc:[]
        },
        totals: {
            exp:0,
            inc:0
        },
        budget:0,
        percentage:-1
    };
    // return object to budgetController
    return{
        addItem : function(type,des,val){
          var newItem,ID;

          //create new ID based on last elemnet +1
          if(data.allItems[type].length > 0)
          {
          ID=data.allItems[type][data.allItems[type].length-1].id+1;
          } else{
              ID = 0;
          }
          // creating exp or inc object
          if (type==='exp'){
          newItem=new Expense(ID,des,val);
          }
          else if (type==='inc')
          {
              newItem=new Income(ID,des,val);
          }

          // pushing the object into the corresponding array in a dataStructure we created 
          data.allItems[type].push(newItem);

          //returning newItem so that other module can use it.
          return newItem;

        },
        // map method
          deleteItem: function(type ,id){
              var ids,index
            data.allItems[type].map( function(current) {
                return current.id;
            });
            index = ids.indexOf(id);
            
            if(index !== -1)
            {
                data.allItems[type].splice(index,1);
            }

          },
        calculateBudget:function(){
            // calculate total income and expenses

            calculateTotal('exp');

            calculateTotal('inc');
             
            // calc the budget ( i.e. inc- exp)
           
             data.budget = data.totals.inc - data.totals.exp;
            
             // calc the exp percentage
             if(data.totals.inc >0){
                data.percentage =Math.round((data.totals.exp /data.totals.inc)*100);
             } else{
                 data.percentage =-1;
             }
              

        },
        calculatePercentages: function()
        {
          data.allItems.exp.forEach(function(cur){
          cur.calcPercentage(data.totals.inc);
          });
        },

         getPercentages: function()
         {
             var allPerc = data.allItems.exp.map(function(){
                 return cur.getPercentage();
             });
             return allPerc;
         },

        getBudget:function(){
            return {
                budget:data.budget,
                totalInc:data.totals.inc,
                totalExp:data.totals.exp,
                percentage:data.percentage
            };
        }
    };
     

})();


var UIController=(function(){

    // Declaring Variable object DOMstrings
var DOMstrings ={
          inputType:'.add__type',
          inputdescription:'.add__description',
          inputValue:'.add__value',
          inputBtn:'.add__btn',
          incomeContainer:'.income__list',
          expensesContainer:'.expense__list',
          budgetLabel:'.budget__value',
          incomeLabel:'.budget__income--value',
          expensesLabel:'.budget__expenses--value',
          percentageLabel:'.budget__expenses--percentage',
          container:'.container',
          expensesPercLabel:'.item__percentage',
          dateLabel : '.budget__title--month'
};
var formatNumber = function(num ,type){
    var numSplit , int , dec;
    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split('.');
    int = numSplit[0];
    if(int.length > 3){
       int = int .substr(0,int.length - 3) + ',' + int.substr(int.length-3,3);
    }
    
    dec =numSplit[1];

    return (type === 'exp' ? '-' : '+') +' '+ int + '.'+dec ;
};
var nodeListForEach = function(list,callback){
    for (var i=0; i<list.length;i++){
        callback(list[i],i)
    }
};

   return {
       // taking input from UI and passing to getInput Object
       getInput:function(){
           return {
               type:document.querySelector(DOMstrings.inputType).value,
               description:document.querySelector(DOMstrings.inputdescription).value,
               value:parseFloat(document.querySelector(DOMstrings.inputValue).value)
           };
       },
           
        addListItem:function(obj ,type)
        {
            var html,newHtml,element;
            // create html strings with placeholder text
            if(type==='inc')
            {
               element = DOMstrings.incomeContainer;
            html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } 
            else if(type==='exp')
            {
                element=DOMstrings.expensesContainer;
            html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            // replace the placeholder text with some actual data
             newHtml =html.replace('%id%',obj.id);
             newHtml =newHtml.replace('%descrption%',obj.description);
             newHtml =newHtml.replace('%value%',formatNumber(obj.value , type));
               
            // Insert the html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml)
             
        },

        // clearing the fields after inserting and displaying it to the user
        clearFields:function(){
         
           var fields = document.querySelectorAll(DOMstrings.inputdescription +','+DOMstrings.inputValue);
           //converting fields list to array
           var fieldArr=Array.prototype.slice.call(fields);

           fieldArr.forEach(function(cur,ind,arr){
               // setting current value which is description and value to empty
                   cur.value="";// it is a value method not a variable
               
           });
           fieldArr[0].focus();

        },
        displayBudget:function(obj){
            var type;
            obj.budget > 0 ? type ='inc' : type ='exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');
            
           
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;
            } else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';

            }
 

        },
        dispalyPercentages:function(percentages){
          
        var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
        
        nodeListForEach(fields,function(current, index){
            if(percentages[index] > 0){
           current.textContent = percentages[index] + '%';
            } else{
                current.textContent ='---';
            }

    });
},

      displayMonth :function(){
         var now , year,month,months;
        now = new Date();
        months =['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
        month = now.getMonth();
        year =now.getFullYear();
        document.querySelector(DOMstrings.dateLabel).textContent = months[month] +' '+year;


      },
      changedType :function(){
       
        var fields = document.querySelectorAll(
            DOMstrings.inputType + ',' +
            DOMstrings.inputdescription + ','+
            DOMstrings.inputValue);
        
       nodeListForEach(fields , function(cur) {
      
         cur.classList.toggle('red-focus');

       });
       document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

      },

       getDOMstrings :function()
       {
           return DOMstrings;
       }
   };

})();

console.log('ajay');

var controller =(function(budgetCtrl,UICtrl)
{

    var setupEventListeners =function(){
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAdditem);

        document.addEventListener('keypress',function(eKey)
        {
           if(eKey.keyCode===13 || eKey.which===13){
              ctrlAdditem();
           }
         
          });
       document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
       document.querySelector(DOm.inputType).addEventListener('change',UICtrl.changedType);
    };
    
    var DOM =UICtrl.getDOMstrings();

    var updateBudget = function(){

        
       //calc the budget
          budgetCtrl.calculateBudget();
       // return the budget
         var budget =budgetCtrl.getBudget();
                 
       //Display the budget on UI
       UICtrl.displayBudget(budget);

    };

      var updatePercentages = function(){
           
        // calculate percentages
           budgetCtrl.calculatePercentages();

        // read percentages from the budget controller
           var percentages = budgetCtrl.getPercentages();
       
        // update the UI with the new percentages

           UICtrl.dispalyPercentages(percentages);

        
      }

    var ctrlAdditem =function()
    {
        var input,newItem;
        // get the field input data
        input=UICtrl.getInput();
        console.log(input);
       
          if(input.description!=="" && !isNaN(input.value) && input.value >0 ){
            
            
       // add the item to the budget controller
     
        newItem = budgetCtrl.addItem(input.type,input.description,input.value);

        // add item to UI
         UICtrl.addListItem(newItem,input.type);
        
         // clear the fields 
 
          UICtrl.clearFields();
 
         // calculate and update budget
          updateBudget();

          // calculate and update percentages

          updatePercentages();
          }

      
    };
    var ctrlDeleteItem = function(event)
    {          var itemID,splitId,type,id;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){
          splitId =itemID.split('-');
          type =splitId[0];
          id=parseInt(splitId[1]);

          // delete the item from ds
           budgetCtrl.deleteItem(type ,ID);

          // delete the ite, from ui


          // update and shoe the budget
        }
    };

    return {
        init:function(){
            console.log('App has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget( {
                budget:0,
                totalInc:0,
                totalExp:0,
                percentage:-1
            });
            setupEventListeners();
       }
    };
    
})(budgetController,UIController);

controller.init();