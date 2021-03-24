var budgetController = (function(){

    class Expense {
        constructor(id, description , value) {
          this.id = id;
          this.description = description;
          this.value = value;
          this.percentages = -1;
        }
        calcPercentages = (totalInc) => {
            if(totalInc > 0)
                this.percentages = Math.round((this.value / totalInc ) * 100);
            else
                this.percentages = -1;   
        }

        getPercentages = () => {
          return this.percentages;
        }
      }
      

    class Income {
    constructor(id, description , value) {
        this.id = id;
        this.description = description;
        this.value = value;
       }
    }
    
   const data = {
      allItems : {
          exp:[],
          inc:[]
      },
      totals:{
          exp: 0,
          inc: 0
      },
      budget : 0,
      percentage : -1
    }
    
    /* For calculating sum of inc and exp */
    const total = type => {
      let sum = 0;
      data.allItems[type].forEach(el => {
            sum += el.value;
      })
      data.totals[type] = sum;
    }

    return {
        addItem : (type , des , value) => {
            let newItem ,ID;
            /* Creating newId , Create obj and Push */
            if(data.allItems[type].length > 0)
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            else
                ID = 0;

           if(type === 'inc')
               newItem = new Income(ID, des , value)
           else 
               newItem = new Expense(ID , des , value)
            
            data.allItems[type].push(newItem); 
            return newItem
        },
       calculateBudget : function(){
           /* Calculate income and expense */
           total('exp');
           total('inc');
          /* Calculate Budget */
          data.budget = data.totals.inc - data.totals.exp;
          /* Calculate the percentage of income that we spent */
          if(data.totals.inc){
            data.percentage = Math.round((data.totals.exp / data.totals.inc ) * 100)
          }else{
              data.percentage = -1;
          }

       },
       calculatePercentages : () => {
           
         data.allItems.exp.forEach(el => {
             el.calcPercentages(data.totals.inc);
         })
       },
       
       getPercentages : () =>{
      let allPerc =   data.allItems.exp.map(el => {
            return el.getPercentages();
            })
            return allPerc;
          },

       getBudget : () => {
           return {
                 budget : data.budget,
                 totalIncome : data.totals.inc,
                 totalExpense : data.totals.exp,
                 percentage : data.percentage
           }
       },

       deleteItem : (type , id) => {
          let ids =  data.allItems[type].map(el => {
               return el.id
           })
          let index  = ids.indexOf(id);
           if(index!== -1){
               data.allItems[type].splice(index , 1 );
           }
       }
    }

})();


var UIController = (function(){

    const DOMStrings = {
        inputType : '.add__type',
        description : '.add__description',
        value : '.add__value',
        btn : '.add__btn',
        incomeContainer : '.income__list',
        expenseContainer : '.expenses__list',
        budgetLabel : '.budget__value',
        incomeLabel : '.budget__income--value',
        expenseLabel : '.budget__expenses--value',
        percentageLabel : '.budget__expenses--percentage',
        container : '.container',
        expPercLabel : '.item__percentage',
        dateLabel : '.budget__title--month'
    }

   const  formatNumber = num  => {
            
        num = Math.abs(num);
        num = num.toFixed(2);
       let numSplit = num.split('.');
      let int = numSplit[0];
       if(int.length > 3){
           int = int.substr(0 ,int.length - 3) + ',' + int.substr(int.length -3 ,3); 
       }
      let dec =  numSplit[1];     
       return int + '.' + dec;
     }

     const nodeListForEach = (fields , callback) => {
        for(let i = 0 ; i < fields.length ;i++){
            callback(fields[i] , i);
        }
      }

    return{
        getInputData: () => {
           return{
               type : document.querySelector(DOMStrings.inputType).value,
               description : document.querySelector(DOMStrings.description).value,
               value : parseFloat(document.querySelector(DOMStrings.value).value)
           };
        },
        addListItem : (obj , type) => {
          let html , element;
          if(type === 'inc'){
              element = DOMStrings.incomeContainer;
              html = `<div class="item clearfix" id="inc-${obj.id}">
              <div class="item__description">${obj.description}</div>
              <div class="right clearfix">
                  <div class="item__value">+ ${formatNumber(obj.value)}</div>
                  <div class="item__delete">
                      <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                  </div>
              </div>
          </div>`
          }
           else {
               element = DOMStrings.expenseContainer;
               html = `<div class="item clearfix" id="exp-${obj.id}">
               <div class="item__description">${obj.description}</div>
               <div class="right clearfix">
                   <div class="item__value">- ${formatNumber(obj.value)}</div>
                   <div class="item__percentage">21%</div>
                   <div class="item__delete">
                       <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                   </div>
               </div>
           </div>`
           }   
           document.querySelector(element).insertAdjacentHTML('beforeend' ,html);
        },
        deleteListItem : id => {
            /* we can only delete the child element , so we need to find the parent first */
            let el = document.getElementById(id);
             el.parentNode.removeChild(el); 

        },

        clearFields : () =>{
          let fields = document.querySelectorAll(`${DOMStrings.description}, ${DOMStrings.value}`);
          let fieldsArray = Array.prototype.slice.call(fields);
           fieldsArray.forEach(element => {
               element.value = '';
           });
           /* changing focus back to description */
            fieldsArray[0].focus();
        },

        displayBudget : obj => {
              document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget);
              document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalIncome);
              document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExpense);

              if(obj.percentage > 0)
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
              else
              document.querySelector(DOMStrings.percentageLabel).textContent = '---';

        },
        
         displayPercentages : (percentages) => {
                    
         let fields = document.querySelectorAll(DOMStrings.expPercLabel);

         nodeListForEach(fields , (el , i) => {
             if(percentages[i] > 0)
                el.textContent = percentages[i] + '%';
             else
                el.textContent = '---';
       });        
        },
        displayMonth : () => {
           const date = new Date();
           const year = date.getFullYear();
           const month = date.getMonth();
           const monthNames = ["January", "February", "March", "April", "May", "June",
             "July", "August", "September", "October", "November", "December"];
           document.querySelector(DOMStrings.dateLabel).textContent = monthNames[month] + ' ' + year;
        },
        changedType : () => {
          const nodeList = document.querySelectorAll(`${DOMStrings.inputType}, ${DOMStrings.description}, ${DOMStrings.value}`);
          nodeListForEach(nodeList , cur => {
              cur.classList.toggle('red-focus');
         })
         document.querySelector(DOMStrings.btn).classList.toggle('red');
        },
        getDOMStrings : () => DOMStrings 
    }

})();


var controller = (function(BDGContrl ,UIcntrl){

    const setUpEventListeners = () =>{
        const DOMStrings = UIcntrl.getDOMStrings(); 
        document.querySelector(DOMStrings.btn).addEventListener('click' , add_item)
        document.addEventListener('keypress' , (event)=>{
        if(event.key === 'Enter')
           add_item();
        })
        document.querySelector(DOMStrings.container).addEventListener('click' , ctrlDeleteItem);
        document.querySelector(DOMStrings.inputType).addEventListener('change' , UIcntrl.changedType);

      }


      const updateBudget = () => {
        /* Calculate the budget */
            BDGContrl.calculateBudget();
        /*  Get budget */
            let budget = BDGContrl.getBudget();
        /* Display the budget */
            UIcntrl.displayBudget(budget);
      }

      const updatePercentages = () =>{
          /* calculate percentages */
             BDGContrl.calculatePercentages()
          /* Read percentages from the controller */
            const perc = BDGContrl.getPercentages();
          /* update the UI */
          UIcntrl.displayPercentages(perc);
      }

    const add_item = () => {
        /* get the field input data */
          let input = UIcntrl.getInputData();
          if(input.description!=='' && !isNaN(input.value) && input.value > 0){
            /* Add the item to the budget controller */
            addedItem = BDGContrl.addItem(input.type , input.description ,input.value);
     
            /* Add the item to the UI */
            UIcntrl.addListItem(addedItem , input.type);

            /* Clear the input fields */
            UIcntrl.clearFields();
            
            /* Calculate and update budget */
            updateBudget();

            /* Update percentages */
            updatePercentages();
        }
     }

     const ctrlDeleteItem = (event) => {
        let splitID ,type,id;
        let itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            id = splitID[1] * 1;
          /* Delete the item from dataStructure*/
            BDGContrl.deleteItem(type , id);

          /* Delete the item from UI */
          UIcntrl.deleteListItem(itemID);
          /* update and show new Budget */
          updateBudget();

          /* update percentages */
          updatePercentages();
        }
     }

 return {
     init : () => {
         setUpEventListeners();
         UIcntrl.displayMonth();
         UIcntrl.displayBudget({
            budget : 0,
            totalIncome : 0,
            totalExpense : 0,
            percentage : 0
      });
     }
 }


})(budgetController , UIController);

controller.init();