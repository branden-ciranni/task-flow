import { createRoot } from "react-dom/client";
import { NodeEditor, GetSchemes, ClassicPreset } from "rete";
import { AreaPlugin, AreaExtensions } from "rete-area-plugin";
import {
  ConnectionPlugin,
  Presets as ConnectionPresets
} from "rete-connection-plugin";
import {
  ReactRenderPlugin,
  Presets,
  ReactArea2D
} from "rete-react-render-plugin";
import {
  AutoArrangePlugin,
  Presets as ArrangePresets
} from "rete-auto-arrange-plugin";

class Node extends ClassicPreset.Node {
  width = 180;
  height = 120;
}
class Connection<N extends Node> extends ClassicPreset.Connection<N, N> {}

type Schemes = GetSchemes<Node, Connection<Node>>;
type AreaExtra = ReactArea2D<Schemes>;

function createNode(label: string, socket: ClassicPreset.Socket) {
  const node = new Node(label);

  node.addInput("port", new ClassicPreset.Input(socket));
  node.addOutput("port", new ClassicPreset.Output(socket));

  return node;
}

export async function createEditor(container: HTMLElement) {
  const socket = new ClassicPreset.Socket("socket");

  const editor = new NodeEditor<Schemes>();
  const area = new AreaPlugin<Schemes, AreaExtra>(container);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  const render = new ReactRenderPlugin<Schemes>({ createRoot });
  const arrange = new AutoArrangePlugin<Schemes>();

  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
    accumulating: AreaExtensions.accumulateOnCtrl()
  });

  render.addPreset(Presets.classic.setup({ area }));

  connection.addPreset(ConnectionPresets.classic.setup());

  arrange.addPreset(ArrangePresets.classic.setup());

  editor.use(area);
  area.use(connection);
  area.use(render);
  area.use(arrange);

  AreaExtensions.simpleNodesOrder(area);

  const a = createNode("A", socket);
  const b = createNode("B", socket);
  const c = createNode("C", socket);
  const d = createNode("D", socket);
  const e = createNode("E", socket);
  const f = createNode("F", socket);

  await editor.addNode(a);
  await editor.addNode(b);
  await editor.addNode(c);
  await editor.addNode(d);
  await editor.addNode(e);
  await editor.addNode(f);

  await editor.addConnection(new Connection(a, "port", b, "port"));
  await editor.addConnection(new Connection(b, "port", c, "port"));
  await editor.addConnection(new Connection(a, "port", d, "port"));
  await editor.addConnection(new Connection(d, "port", e, "port"));
  await editor.addConnection(new Connection(e, "port", f, "port"));
  await editor.addConnection(new Connection(c, "port", e, "port"));

  await arrange.layout();

  setTimeout(() => {
    AreaExtensions.zoomAt(area, editor.getNodes());
  }, 10);
  return {
    destroy: () => area.destroy()
  };
}
