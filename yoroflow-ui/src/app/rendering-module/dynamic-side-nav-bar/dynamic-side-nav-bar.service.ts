import { Injectable } from '@angular/core';
import { renderHidden } from 'highcharts';
import { GuidedTourService, Orientation } from 'ngx-guided-tour';

@Injectable({
  providedIn: 'root'
})
export class DynamicSideNavBarService {

  constructor(private guidedTourService: GuidedTourService,) {
   }
   getTours(userRoles){
    if (userRoles.includes("Account Owner") || userRoles.includes("Account Administrator")) {
      this.guidedTourService.startTour({
        tourId: 'purchases-tour',
        useOrb: false,
        preventBackdropFromAdvancing:true,

        steps: [
          {
            title: 'Automate Your Business Processes with Workflow Management Software',
            selector: '.demo-title',
            content: 'Yoroflow is completely flexible because it helps automate the entire business processes that manage complex work effectively and produce a high value for your enterprise.',
            orientation: Orientation.TopLeft,
            scrollAdjustment:1
          },
          {
            title: 'Create Team',
            selector: '.teams',
            content: 'In the Administration tab, the Teams option is available. To create a Team , enter the Team Name, and Description. Also, Admin can associate the users to a specific team. For that, mention the team name in the Teams and check how many users are associated with the team using the Check box.',
            orientation: Orientation.BottomLeft

          },
          {
            title: 'Create User',
            selector: '.Administration',
            content: 'In the ‘Update Organization’ tab, there are Payment & Subscription options available. As per your need, you can choose any subscription plan (Basic / Standard / Pro) and click the ‘Update Your Subscription’ button. Once you enter the billing address and payment details, click the ‘Process Payment’ button to start payment.',
            orientation: Orientation.BottomLeft

          },
          {
            title: 'Create Workspace',
            selector: '.workspace',
            content: 'Click your profile icon to Add New Workspace by using Workspace Name and Workspace ID. If you need to create multiple work across different departments or teams, you can segregate one of your existing Workspaces into a Team.',
            orientation: Orientation.TopLeft
          },
          {
            title: 'Create Workflow',
            selector: '.Workflow',
            content: 'You can create a new workflow from scratch. Also there are ready-made workflows with categories such as HR, Sales, Marketing, Start-ups, Integration, Work from Home, Project Management, and Software Development, and more. ',
            orientation: Orientation.BottomLeft
          },
          {
            title: 'Create Taskboard',
            selector: '.Taskboard',
            content: 'Once you choose your template, start creating the board by mentioning the Task board name, Task board key, along with the Task board description. Once the board is successfully created, you can create a card as well by selecting the “Add Task” option from the Task Board Column.',
            orientation: Orientation.BottomLeft
          },
        ]
      });
    }else if(userRoles.includes("Application Administrator")){
        this.guidedTourService.startTour({
          tourId: 'purchases-tour',
          useOrb: false,
          preventBackdropFromAdvancing:true,
          steps: [
            {
              title: 'Automate Your Business Processes with Workflow Management Software',
              selector: '.demo-title',
              content: 'Yoroflow is completely flexible because it helps automate the entire business processes that manage complex work effectively and produce a high value for your enterprise.',
              orientation: Orientation.TopLeft
            },
  
  
            {
              title: 'Create Application',
              selector: '.Application',
              content: 'In the Application tab, there is a Create Application option available. Enter the Application Name, Application Identifier, Time Zone, Default Language as shown on the screen to create a new application. Using the Dropdown field, Admin can select the organization theme and upload the application logo. ',
              orientation: Orientation.BottomLeft
  
            },
          ]
        });
      }
    else if(userRoles.includes("User Administrator")){
        this.guidedTourService.startTour({
          tourId: 'purchases-tour',
          useOrb: false,
          preventBackdropFromAdvancing:true,
          steps: [
            {
              title: 'Automate Your Business Processes with Workflow Management Software',
              selector: '.demo-title',
              content: 'Yoroflow is completely flexible because it helps automate the entire business processes that manage complex work effectively and produce a high value for your enterprise.',
              orientation: Orientation.TopLeft
            },
            {
              title: 'Create Team',
              selector: '.teams',
              content: 'In the Administration tab, the Teams option is available. To create a Team , enter the Team Name, and Description. Also, Admin can associate the users to a specific team. For that, mention the team name in the Teams and check how many users are associated with the team using the Check box.',
              orientation: Orientation.BottomLeft
  
            },
            {
              title: 'Create User',
              selector: '.Administration',
              content: 'In the ‘Update Organization’ tab, there are Payment & Subscription options available. As per your need, you can choose any subscription plan (Basic / Standard / Pro) and click the ‘Update Your Subscription’ button. Once you enter the billing address and payment details, click the ‘Process Payment’ button to start payment.',
              orientation: Orientation.BottomLeft
  
            },
          ]
        });
      }
      else if(userRoles.includes("Billing Administrator")){
        this.guidedTourService.startTour({
          tourId: 'purchases-tour',
          useOrb: false,
          preventBackdropFromAdvancing:true,
          steps: [
            {
              title: 'Automate Your Business Processes with Workflow Management Software',
              selector: '.demo-title',
              content: 'Yoroflow is completely flexible because it helps automate the entire business processes that manage complex work effectively and produce a high value for your enterprise.',
              orientation: Orientation.TopLeft
            },
  
            {
              title: 'Subscription',
              selector: '.Administration',
              content: 'Subscription Plan means a fixed term plan which relates to the Services as specified in the Supplier Agreement.',
              orientation: Orientation.BottomLeft
  
            },
  
          ]
        });    
        }
      else  if ((userRoles && userRoles.length === 1 && userRoles[0] === 'User') || (userRoles && userRoles.length === 1 && userRoles[0] === 'Guest')) {
          this.guidedTourService.startTour({
            tourId: 'purchases-tour',
            useOrb: false,
            preventBackdropFromAdvancing:true,
            steps: [
              {
                title: 'Automate Your Business Processes with Workflow Management Software',
                selector: '.demo-title',
                content: 'Yoroflow is completely flexible because it helps automate the entire business processes that manage complex work effectively and produce a high value for your enterprise.',
                orientation: Orientation.TopLeft
              },
    
              {
                title: 'Create Workspace',
                selector: '.workspace',
                content: 'Click your profile icon to Add New Workspace by using Workspace Name and Workspace ID. If you need to create multiple work across different departments or teams, you can segregate one of your existing Workspaces into a Team.',
                orientation: Orientation.TopLeft
              },
              {
                title: 'Create Workflow',
                selector: '.Workflow',
                content: 'You can create a new workflow from scratch. Also there are ready-made workflows with categories such as HR, Sales, Marketing, Start-ups, Integration, Work from Home, Project Management, and Software Development, and more. ',
                orientation: Orientation.BottomLeft
              },
              {
                title: 'Create Taskboard',
                selector: '.Taskboard',
                content: 'Once you choose your template, start creating the board by mentioning the Task board name, Task board key, along with the Task board description. Once the board is successfully created, you can create a card as well by selecting the “Add Task” option from the Task Board Column.',
                orientation: Orientation.BottomLeft
              },
            ]
          });
        }
       else if (userRoles && userRoles.length === 1 && userRoles[0] === 'Workflow User') {
          this.guidedTourService.startTour({
            tourId: 'purchases-tour',
            useOrb: false,
            preventBackdropFromAdvancing:true,
            steps: [
              {
                title: 'Automate Your Business Processes with Workflow Management Software',
                selector: '.demo-title',
                content: 'Yoroflow is completely flexible because it helps automate the entire business processes that manage complex work effectively and produce a high value for your enterprise.',
                orientation: Orientation.TopLeft
              },     
              {
                title: 'Create Workflow',
                selector: '.Workflow',
                content: 'You can create a new workflow from scratch. Also there are ready-made workflows with categories such as HR, Sales, Marketing, Start-ups, Integration, Work from Home, Project Management, and Software Development, and more. ',
                orientation: Orientation.BottomLeft
              },
            ]
          });
        }
       else if (userRoles && userRoles.length === 1 && userRoles[0] === 'Taskboard User') {
          this.guidedTourService.startTour({
            tourId: 'purchases-tour',
            useOrb: false,
            preventBackdropFromAdvancing:true,
            steps: [
              {
                title: 'Automate Your Business Processes with Workflow Management Software',
                selector: '.demo-title',
                content: 'Yoroflow is completely flexible because it helps  the entire business processes that manage complex work effectively and produce a high value for your enterprise.',
                orientation: Orientation.TopLeft
              },  
              {
                title: 'Create Taskboard',
                selector: '.Taskboard',
                content: 'Once you choose your template, start creating the board by mentioning the Task board name, Task board key, along with the Task board description. Once the board is successfully created, you can create a card as well by selecting the “Add Task” option from the Task Board Column.',
                orientation: Orientation.BottomLeft
              },
    
            ]
          });
        } 

   }
}
