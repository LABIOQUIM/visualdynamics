Clazz.declarePackage ("J.adapter.writers");
Clazz.load (["J.api.JmolWriter"], "J.adapter.writers.CMLWriter", ["JU.BS", "$.PT", "$.SB", "J.api.Interface", "JU.Edge", "JV.Viewer"], function () {
c$ = Clazz.decorateAsClass (function () {
this.vwr = null;
this.oc = null;
this.atomsMax = 0;
this.addBonds = false;
this.doTransform = false;
this.allTrajectories = false;
Clazz.instantialize (this, arguments);
}, J.adapter.writers, "CMLWriter", null, J.api.JmolWriter);
Clazz.makeConstructor (c$, 
function () {
});
Clazz.overrideMethod (c$, "set", 
function (viewer, out, data) {
this.vwr = viewer;
this.oc = (this.oc == null ? this.vwr.getOutputChannel (null, null) : this.oc);
this.atomsMax = (data[0]).intValue ();
this.addBonds = (data[1]).booleanValue ();
this.doTransform = (data[2]).booleanValue ();
this.allTrajectories = (data[3]).booleanValue ();
}, "JV.Viewer,JU.OC,~A");
Clazz.overrideMethod (c$, "write", 
function (bs) {
var sb =  new JU.SB ();
var nAtoms = bs.cardinality ();
if (nAtoms == 0) return "";
if (JV.Viewer.isJS) J.api.Interface.getInterface ("JU.XmlUtil", this.vwr, "file");
J.adapter.writers.CMLWriter.openTag (sb, "molecule");
J.adapter.writers.CMLWriter.openTag (sb, "atomArray");
var bsAtoms =  new JU.BS ();
var atoms = this.vwr.ms.at;
for (var i = bs.nextSetBit (0); i >= 0; i = bs.nextSetBit (i + 1)) {
if (--this.atomsMax < 0) break;
var atom = atoms[i];
var name = atom.getAtomName ();
JU.PT.rep (name, "\"", "''");
bsAtoms.set (atom.i);
J.adapter.writers.CMLWriter.appendTag (sb, "atom",  Clazz.newArray (-1, ["id", "a" + (atom.i + 1), "title", atom.getAtomName (), "elementType", atom.getElementSymbol (), "x3", "" + atom.x, "y3", "" + atom.y, "z3", "" + atom.z]));
}
J.adapter.writers.CMLWriter.closeTag (sb, "atomArray");
if (this.addBonds) {
J.adapter.writers.CMLWriter.openTag (sb, "bondArray");
var bondCount = this.vwr.ms.bondCount;
var bonds = this.vwr.ms.bo;
for (var i = 0; i < bondCount; i++) {
var bond = bonds[i];
var a1 = bond.atom1;
var a2 = bond.atom2;
if (!bsAtoms.get (a1.i) || !bsAtoms.get (a2.i)) continue;
var order = JU.Edge.getCmlBondOrder (bond.order);
if (order == null) continue;
J.adapter.writers.CMLWriter.appendTag (sb, "bond",  Clazz.newArray (-1, ["atomRefs2", "a" + (bond.atom1.i + 1) + " a" + (bond.atom2.i + 1), "order", order]));
}
J.adapter.writers.CMLWriter.closeTag (sb, "bondArray");
}J.adapter.writers.CMLWriter.closeTag (sb, "molecule");
return sb.toString ();
}, "JU.BS");
c$.openTag = Clazz.defineMethod (c$, "openTag", 
 function (sb, name) {
sb.append ("<").append (name).append (">\n");
}, "JU.SB,~S");
c$.appendTag = Clazz.defineMethod (c$, "appendTag", 
 function (sb, name, attributes) {
sb.append ("<").append (name);
for (var i = 0; i < attributes.length; i++) {
sb.append (" ").append (attributes[i]).append ("=\"").append (attributes[++i]).append ("\"");
}
sb.append ("/>\n");
}, "JU.SB,~S,~A");
c$.closeTag = Clazz.defineMethod (c$, "closeTag", 
 function (sb, name) {
sb.append ("</").append (name).append (">\n");
}, "JU.SB,~S");
Clazz.overrideMethod (c$, "toString", 
function () {
return (this.oc == null ? "" : this.oc.toString ());
});
});
