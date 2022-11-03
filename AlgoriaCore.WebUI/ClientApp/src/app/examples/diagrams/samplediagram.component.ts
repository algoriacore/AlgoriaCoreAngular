import { Component, Injector, OnInit } from '@angular/core';
import { Connector, ConnectorModel, NodeModel } from '@syncfusion/ej2-angular-diagrams';
import 'moment-duration-format';
import 'moment-timezone';
import { AppComponentBase } from 'src/app/app-component-base';
import { AppComponent } from '../../app.component';

@Component({
    templateUrl: './samplediagram.component.html'
})
export class SampleDiagramComponent extends AppComponentBase implements OnInit {

    public nodes: NodeModel[] = [
        {
            // Define unique id for each shape
            id: 'Start', offsetY: 50, annotations: [{ content: 'Start' }],
            // Define the shape type and flow shape
            shape: { type: 'Flow', shape: 'Terminator' }
        },
        {
            id: 'Init', offsetY: 150, annotations: [{ content: 'var i = 0;' }],
            shape: { type: 'Flow', shape: 'Process' }
        },
        {
            id: 'Condition', offsetY: 250, annotations: [{ content: 'i < 10?' }],
            shape: { type: 'Flow', shape: 'Decision' },
            // Creation of ports
            ports: [{ offset: { x: 0, y: 0.5 }, id: "port1" }, { offset: { x: 1, y: 0.5 }, id: "port2" }]
        },
        {
            id: 'Print', offsetY: 350, annotations: [{ content: 'print(\'Hello!!\');' }],
            shape: { type: 'Flow', shape: 'PreDefinedProcess' }
        },
        {
            id: 'Increment', offsetY: 450, annotations: [{ content: 'i++;' }],
            shape: { type: 'Flow', shape: 'Process' },
            ports: [{ offset: { x: 0, y: 0.5 }, id: "port1" }, { offset: { x: 1, y: 0.5 }, id: "port2" }]
        },
        {
            id: 'End', offsetY: 550, annotations: [{ content: 'End' }],
            shape: { type: 'Flow', shape: 'Terminator' },
            ports: [{ offset: { x: 0, y: 0.5 }, id: "port1" }, { offset: { x: 1, y: 0.5 }, id: "port2" }]
        }
    ];

    public connectors: ConnectorModel[] = [
        {
            // Define unique ID for connectors
            id: 'connector1',

            // SourceID and targetID property is used to define the relationship between shapes
            sourceID: 'Start', targetID: 'Init'
        },
        {
            id: 'connector2', sourceID: 'Init', targetID: 'Condition'
        },
        {
            id: 'connector3', sourceID: 'Condition', targetID: 'Print',
            annotations: [{ content: 'Yes' }]
        },
        {
            id: 'connector4', sourceID: 'Condition', targetID: 'End',
            sourcePortID: 'port2', targetPortID: 'port2',
            annotations: [{ content: 'No' }]
        },
        { id: 'connector5', sourceID: 'Print', targetID: 'Increment' },
        {
            id: 'connector6', sourceID: 'Increment', targetID: 'Condition',
            sourcePortID: 'port1', targetPortID: 'port1'
        }
    ];

    constructor(
        injector: Injector,
        private app: AppComponent
    ) {
        super(injector);
    }

    ngOnInit() {
        // Intentional
    }

    public nodeDefaults(obj: NodeModel): NodeModel {
        let node: NodeModel = {};

        node.height = 50;
        node.width = 140;
        node.offsetX = 300;

        return node;
    }

    public connDefaults(obj: Connector): void {
        obj.type = 'Orthogonal';
        obj.targetDecorator = { shape: 'Arrow', width: 10, height: 10 };
    }

}
