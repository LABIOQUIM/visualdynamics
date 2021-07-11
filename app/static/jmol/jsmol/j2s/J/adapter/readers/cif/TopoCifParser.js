Clazz.declarePackage ("J.adapter.readers.cif");
Clazz.load (["J.adapter.readers.cif.CifReader", "J.adapter.smarter.Atom", "JU.BS", "$.Lst"], "J.adapter.readers.cif.TopoCifParser", ["java.lang.Double", "$.Exception", "$.Float", "java.util.Hashtable", "JU.P3", "$.V3", "J.adapter.readers.cif.Cif2DataParser", "JU.Logger"], function () {
c$ = Clazz.decorateAsClass (function () {
this.reader = null;
this.nodes = null;
this.links = null;
this.nets = null;
this.allowedTypes = "+v+hb+";
this.bondlist = "";
this.pre = "Net1";
if (!Clazz.isClassDefined ("J.adapter.readers.cif.TopoCifParser.Node")) {
J.adapter.readers.cif.TopoCifParser.$TopoCifParser$Node$ ();
}
if (!Clazz.isClassDefined ("J.adapter.readers.cif.TopoCifParser.Link")) {
J.adapter.readers.cif.TopoCifParser.$TopoCifParser$Link$ ();
}
if (!Clazz.isClassDefined ("J.adapter.readers.cif.TopoCifParser.Net")) {
J.adapter.readers.cif.TopoCifParser.$TopoCifParser$Net$ ();
}
if (!Clazz.isClassDefined ("J.adapter.readers.cif.TopoCifParser.TopoPrimitive")) {
J.adapter.readers.cif.TopoCifParser.$TopoCifParser$TopoPrimitive$ ();
}
this.linkIndex = 0;
this.nodeIndex = 0;
this.netIndex = 0;
this.ac0 = -1;
Clazz.instantialize (this, arguments);
}, J.adapter.readers.cif, "TopoCifParser", null, J.adapter.readers.cif.CifReader.Parser);
Clazz.prepareFields (c$, function () {
this.nodes =  new JU.Lst ();
this.links =  new JU.Lst ();
this.nets =  new JU.Lst ();
});
Clazz.makeConstructor (c$, 
function () {
});
Clazz.defineMethod (c$, "addNodeIfNull", 
function (label) {
var node = this.getTopo (this.nodes, label, 'n');
var atom = this.reader.asc.getAtomFromName (node.atomName);
if (atom == null) {
atom = this.reader.asc.getAtomFromName (label);
if (atom == null) throw  new Exception ("TopoCIFParser.addNodeIfNull no atom " + label);
var n = Clazz.innerTypeInstance (J.adapter.readers.cif.TopoCifParser.Node, this, null, this.nodeIndex++, atom.atomName, atom.atomName, atom.getElementSymbol (), this.pre);
n.set (atom.x, atom.y, atom.z);
this.nodes.addLast (n);
atom = n;
}return atom;
}, "~S");
Clazz.defineMethod (c$, "getTopo", 
function (l, id, type) {
for (var i = 0; i < l.size (); i++) {
var o = l.get (i);
switch (type) {
case 'n':
if ((o).label.equals (id)) return o;
break;
case 'N':
if ((o).id.equals (id)) return o;
break;
}
}
return null;
}, "JU.Lst,~S,~S");
Clazz.overrideMethod (c$, "setReader", 
function (reader) {
if (reader.checkFilterKey ("NOTOPOL")) {
return this;
}this.reader = reader;
var types = reader.getFilter ("TOPOS_TYPES");
if (types != null && types.length > 1) types = "+" + types.substring (1).toLowerCase () + "+";
if (reader.doApplySymmetry) reader.asc.setNoAutoBond ();
return this;
}, "J.adapter.readers.cif.CifReader");
Clazz.overrideMethod (c$, "processBlock", 
function (key) {
if (this.reader == null) return;
if (this.ac0 < 0) {
this.ac0 = this.reader.asc.ac;
}if (this.reader.ucItems != null) {
this.reader.allow_a_len_1 = true;
for (var i = 0; i < 6; i++) this.reader.setUnitCellItem (i, this.reader.ucItems[i]);

}this.reader.parseLoopParameters (J.adapter.readers.cif.TopoCifParser.topolFields);
while (this.reader.cifParser.getData ()) {
if (this.getField (18) != null) {
this.processNode ();
} else if (this.getField (0) != null) {
this.processLink ();
} else if (this.getField (24) != null) {
this.processNet ();
}}
}, "~S");
Clazz.defineMethod (c$, "processNode", 
 function () {
var label = this.getField (18);
var atomLabel = this.getField (17);
var sym = this.getField (23);
var x = this.getFloat (19);
var y = this.getFloat (20);
var z = this.getFloat (21);
var netID = this.getField (22);
var n = Clazz.innerTypeInstance (J.adapter.readers.cif.TopoCifParser.Node, this, null, this.nodeIndex++, label, atomLabel, sym, netID);
this.nodes.addLast (n);
if (!Float.isNaN (x)) n.set (x, y, z);
});
Clazz.defineMethod (c$, "processLink", 
 function () {
var t1 =  Clazz.newIntArray (3, 0);
var t2 =  Clazz.newIntArray (3, 0);
var type = this.getField (11);
if (this.allowedTypes.indexOf ("+" + type + "+") < 0) return;
var label1 = this.getField (0);
var label2 = this.getField (1);
var d = this.getFloat (2);
if (d == 0) {
JU.Logger.warn ("TopoCifParser invalid distance");
return;
}var multiplicity = this.getInt (12);
var angle = this.getFloat (13);
var op1 = this.getInt (3);
var op2 = this.getInt (7);
var order = this.getInt (16);
var field = this.getField (14);
if (field.length > 1) {
t1 = J.adapter.readers.cif.Cif2DataParser.getIntArrayFromStringList (field, 3);
} else {
t1[0] = this.getInt (4);
t1[1] = this.getInt (5);
t1[2] = this.getInt (6);
}field = this.getField (15);
if (field.length > 1) {
t2 = J.adapter.readers.cif.Cif2DataParser.getIntArrayFromStringList (field, 3);
} else {
t2[0] = this.getInt (8);
t2[1] = this.getInt (9);
t2[2] = this.getInt (10);
}this.links.addLast (Clazz.innerTypeInstance (J.adapter.readers.cif.TopoCifParser.Link, this, null, this.linkIndex++, label1, label2, d, op1, t1, op2, t2, multiplicity, type, angle, order));
});
Clazz.defineMethod (c$, "processNet", 
 function () {
this.nets.addLast (Clazz.innerTypeInstance (J.adapter.readers.cif.TopoCifParser.Net, this, null, this.netIndex++, this.getField (24)));
});
Clazz.overrideMethod (c$, "finalizeReader", 
function () {
if (this.reader == null) return false;
for (var i = 0; i < this.nodes.size (); i++) {
this.nodes.get (i).finalizeNode ();
}
for (var i = 0; i < this.links.size (); i++) {
this.links.get (i).finalizeLink ();
}
this.reader.applySymmetryAndSetTrajectory ();
return true;
});
Clazz.overrideMethod (c$, "finalizeSymmetry", 
function (haveSymmetry) {
if (this.reader == null || !haveSymmetry || !this.reader.doApplySymmetry) return;
var sym = this.reader.asc.getXSymmetry ().getBaseSymmetry ();
var nOps = sym.getSpaceGroupOperationCount ();
var operations =  new Array (nOps);
for (var i = 0; i < nOps; i++) {
operations[i] = sym.getSpaceGroupOperationRaw (i);
}
var carts =  new Array (this.reader.asc.ac);
var atoms = this.reader.asc.atoms;
for (var i = this.reader.asc.ac; --i >= this.ac0; ) {
carts[i] = JU.P3.newP (atoms[i]);
sym.toCartesian (carts[i], true);
}
var n = 0;
var bsConnected =  new JU.BS ();
var nLinks = this.links.size ();
for (var i = 0; i < nLinks; i++) {
var link = this.links.get (i);
link.setPrimitives (sym, operations);
n += this.setBonds (i, atoms, carts, link, sym, nOps, bsConnected);
}
if (bsConnected.cardinality () > 0) this.reader.asc.bsAtoms = bsConnected;
this.reader.appendLoadNote ("TopoCifParser read " + nLinks + " links; created " + n + " edges and " + bsConnected.cardinality () + " nodes");
var info =  new JU.Lst ();
for (var i = 0; i < nLinks; i++) {
info.addLast (this.links.get (i).getInfo ());
}
this.reader.asc.setCurrentModelInfo ("topology", info);
}, "~B");
Clazz.defineMethod (c$, "setBonds", 
 function (index, atoms, carts, link, sym, nOps, bsConnected) {
var nbonds = 0;
var bs1 =  new JU.BS ();
var bs2 =  new JU.BS ();
for (var i = this.reader.asc.ac; --i >= this.ac0; ) {
var a = atoms[i];
if (!(Clazz.instanceOf (a, J.adapter.readers.cif.TopoCifParser.Node))) continue;
if (a.atomSite == link.a1.atomSite) {
bs1.set (i);
}if (a.atomSite == link.a2.atomSite) {
bs2.set (i);
}}
var pa =  new JU.P3 ();
var bsym =  new JU.BS ();
for (var i1 = bs1.nextSetBit (0); i1 >= 0; i1 = bs1.nextSetBit (i1 + 1)) {
var at1 = atoms[i1];
bsym.clearAll ();
for (var i = 0; i < nOps; i++) {
var prim = link.primitives[i];
if (prim == null) continue;
pa.setT (at1);
sym.unitize (pa);
if (J.adapter.readers.cif.TopoCifParser.isEqualD (pa, prim.p1u, 0)) {
if (this.reader.debugging) JU.Logger.debug ("TopoCifParser " + link.info () + " primitive: " + prim.info ());
bsym.set (i);
}}
link.symops = bsym;
for (var i2 = bs2.nextSetBit (0); i2 >= 0; i2 = bs2.nextSetBit (i2 + 1)) {
if (i1 == i2 || !J.adapter.readers.cif.TopoCifParser.isEqualD (carts[i1], carts[i2], link.d)) continue;
var at2 = atoms[i2];
var va12 = JU.V3.newVsub (at2, at1);
for (var i = bsym.nextSetBit (0); i >= 0; i = bsym.nextSetBit (i + 1)) {
if (!J.adapter.readers.cif.TopoCifParser.isEqualD (va12, link.primitives[i].v12f, 0)) continue;
var key = "," + at1.index + "," + at2.index + ",";
if (this.bondlist.indexOf (key) >= 0) continue;
this.bondlist += key + at1.index + ",";
nbonds++;
if (this.reader.debugging) JU.Logger.debug (nbonds + " " + at1 + " " + at2 + " " + at1.index + " " + at2.index);
this.reader.asc.addNewBondWithOrderA (at1, at2, link.order);
bsConnected.set (at1.index);
bsConnected.set (at2.index);
}
}
}
return nbonds;
}, "~N,~A,~A,J.adapter.readers.cif.TopoCifParser.Link,J.api.SymmetryInterface,~N,JU.BS");
c$.isEqualD = Clazz.defineMethod (c$, "isEqualD", 
function (p1, p2, d) {
return Double.isNaN (d) || Math.abs (p1.distance (p2) - d) < J.adapter.readers.cif.TopoCifParser.ERROR_TOLERANCE;
}, "JU.T3,JU.T3,~N");
Clazz.defineMethod (c$, "getField", 
 function (field) {
var f = this.reader.getField (field);
return ("\0".equals (f) ? null : f);
}, "~N");
Clazz.defineMethod (c$, "getInt", 
 function (field) {
var f = this.getField (field);
return (f == null ? -2147483648 : this.reader.parseIntStr (f));
}, "~N");
Clazz.defineMethod (c$, "getFloat", 
 function (field) {
var f = this.getField (field);
return (f == null ? NaN : this.reader.parseFloatStr (f));
}, "~N");
c$.$TopoCifParser$Node$ = function () {
Clazz.pu$h(self.c$);
c$ = Clazz.decorateAsClass (function () {
Clazz.prepareCallback (this, arguments);
this.idx = 0;
this.label = null;
this.netID = null;
this.net = null;
this.formula = null;
Clazz.instantialize (this, arguments);
}, J.adapter.readers.cif.TopoCifParser, "Node", J.adapter.smarter.Atom);
Clazz.makeConstructor (c$, 
function (a, b, c, d, e) {
Clazz.superConstructor (this, J.adapter.readers.cif.TopoCifParser.Node);
this.idx = a;
this.label = b;
this.netID = e;
this.formula = d;
if (d != null && d.indexOf (" ") < 0) {
this.atomName = d;
this.getElementSymbol ();
if (!d.equals (this.elementSymbol)) this.elementSymbol = "Z";
}this.atomName = c;
}, "~N,~S,~S,~S,~S");
Clazz.defineMethod (c$, "finalizeNode", 
function () {
var a = (this.atomName == null ? null : this.b$["J.adapter.readers.cif.TopoCifParser"].reader.asc.getAtomFromName (this.atomName));
if (a == null) {
if (Float.isNaN (this.x)) throw  new Exception ("TopoCIFParser.finalizeNode no atom " + this.atomName);
a = this;
this.atomName = this.label;
if (this.elementSymbol == null) this.getElementSymbol ();
} else {
this.atomName = a.atomName;
this.elementSymbol = a.getElementSymbol ();
if (this.atomName == null) this.atomName = a.atomName = a.elementSymbol + (this.idx + 1);
this.set (a.x, a.y, a.z);
this.atomName = this.label;
}if (this.b$["J.adapter.readers.cif.TopoCifParser"].nets.size () == 0) this.b$["J.adapter.readers.cif.TopoCifParser"].nets.addLast (Clazz.innerTypeInstance (J.adapter.readers.cif.TopoCifParser.Net, this, null, this.b$["J.adapter.readers.cif.TopoCifParser"].netIndex++, this.b$["J.adapter.readers.cif.TopoCifParser"].pre));
if (this.netID == null) this.netID = this.b$["J.adapter.readers.cif.TopoCifParser"].pre;
var b = this.b$["J.adapter.readers.cif.TopoCifParser"].getTopo (this.b$["J.adapter.readers.cif.TopoCifParser"].nets, this.netID, 'N');
if (b == null) b = this.b$["J.adapter.readers.cif.TopoCifParser"].getTopo (this.b$["J.adapter.readers.cif.TopoCifParser"].nets, this.b$["J.adapter.readers.cif.TopoCifParser"].pre, 'N');
this.atomName = this.netID + "_" + this.label;
this.b$["J.adapter.readers.cif.TopoCifParser"].reader.addCifAtom (this, this.atomName, null, null);
});
Clazz.defineMethod (c$, "info", 
function () {
return "[node " + this.idx + " " + this.label + "/" + this.atomName + " " + Clazz.superCall (this, J.adapter.readers.cif.TopoCifParser.Node, "toString", []) + "]";
});
Clazz.defineMethod (c$, "toString", 
function () {
return this.info ();
});
c$ = Clazz.p0p ();
};
c$.$TopoCifParser$Link$ = function () {
Clazz.pu$h(self.c$);
c$ = Clazz.decorateAsClass (function () {
Clazz.prepareCallback (this, arguments);
this.idx = 0;
this.label1 = null;
this.label2 = null;
this.a1 = null;
this.a2 = null;
this.op1 = 0;
this.op2 = 0;
this.t1 = null;
this.t2 = null;
this.dt = null;
this.type = null;
this.voronoiAngle = 0;
this.multiplicity = 0;
this.m1 = null;
this.m2 = null;
this.p1f = null;
this.p2f = null;
this.d = 0;
this.order = 0;
this.primitives = null;
this.symops = null;
this.topoOrder = 0;
Clazz.instantialize (this, arguments);
}, J.adapter.readers.cif.TopoCifParser, "Link");
Clazz.makeConstructor (c$, 
function (a, b, c, d, e, f, g, h, i, j, k, l) {
this.idx = a;
this.topoOrder = l;
this.label1 = b;
this.label2 = c;
this.d = d;
this.op1 = e - 1;
this.op2 = g - 1;
this.type = j;
this.order = ("vw".equals (j) ? 33 : "hb".equals (j) ? 2048 : 1);
this.t1 = JU.P3.new3 (f[0], f[1], f[2]);
this.t2 = JU.P3.new3 (h[0], h[1], h[2]);
this.dt = JU.P3.new3 ((h[0] - f[0]), (h[1] - f[1]), (h[2] - f[2]));
this.multiplicity = i;
this.voronoiAngle = k;
}, "~N,~S,~S,~N,~N,~A,~N,~A,~N,~S,~N,~N");
Clazz.defineMethod (c$, "getInfo", 
function () {
var a =  new java.util.Hashtable ();
a.put ("label1", this.a1.atomName);
a.put ("label2", this.a2.atomName);
if (!Float.isNaN (this.d)) a.put ("distance", Float.$valueOf (this.d));
a.put ("symop1", Integer.$valueOf (this.op1 + 1));
a.put ("symop2", Integer.$valueOf (this.op2 + 1));
a.put ("t1", this.t1);
a.put ("t2", this.t2);
a.put ("multiplicity", Integer.$valueOf (this.multiplicity));
a.put ("type", this.type);
a.put ("voronoiSolidAngle", Float.$valueOf (this.voronoiAngle));
a.put ("atomIndex1", Integer.$valueOf (this.a1.index));
a.put ("atomIndex2", Integer.$valueOf (this.a2.index));
a.put ("index", Integer.$valueOf (this.idx + 1));
a.put ("op1", this.m1);
a.put ("op2", this.m2);
a.put ("dt", this.dt);
a.put ("primitive1", this.p1f);
a.put ("primitive2", this.p2f);
var b =  Clazz.newIntArray (this.symops.cardinality (), 0);
for (var c = 0, d = this.symops.nextSetBit (0); d >= 0; d = this.symops.nextSetBit (d + 1)) {
b[c++] = d + 1;
}
a.put ("primitiveSymops", b);
a.put ("topoOrder", Integer.$valueOf (this.topoOrder));
a.put ("order", Integer.$valueOf (this.order));
return a;
});
Clazz.defineMethod (c$, "setPrimitives", 
function (a, b) {
var c = b.length;
this.p1f = JU.P3.new3 (this.a1.x, this.a1.y, this.a1.z);
this.p2f = JU.P3.new3 (this.a2.x, this.a2.y, this.a2.z);
(this.m1 = b[this.op1]).rotTrans (this.p1f);
(this.m2 = b[this.op2]).rotTrans (this.p2f);
this.p2f.add (this.dt);
this.primitives =  new Array (c);
for (var d = 0; d < c; d++) {
var e = Clazz.innerTypeInstance (J.adapter.readers.cif.TopoCifParser.TopoPrimitive, this, null, this, d + 1, a, b[d]);
if (!e.isValid) continue;
this.primitives[d] = e;
}
}, "J.api.SymmetryInterface,~A");
Clazz.defineMethod (c$, "info", 
function () {
return "[link " + (this.idx + 1) + " " + this.label1 + " " + this.label2 + " " + this.d + " " + this.type + "]";
});
Clazz.overrideMethod (c$, "toString", 
function () {
return this.info ();
});
Clazz.defineMethod (c$, "finalizeLink", 
function () {
this.a1 = this.b$["J.adapter.readers.cif.TopoCifParser"].addNodeIfNull (this.label1);
this.a2 = this.b$["J.adapter.readers.cif.TopoCifParser"].addNodeIfNull (this.label2);
if (this.a1 == null || this.a2 == null) {
JU.Logger.warn ("TopoCifParser atom " + (this.a1 == null ? this.label1 : this.label2) + " could not be found");
return;
}});
c$ = Clazz.p0p ();
};
c$.$TopoCifParser$Net$ = function () {
Clazz.pu$h(self.c$);
c$ = Clazz.decorateAsClass (function () {
Clazz.prepareCallback (this, arguments);
this.idx = 0;
this.nodes = null;
this.id = null;
Clazz.instantialize (this, arguments);
}, J.adapter.readers.cif.TopoCifParser, "Net");
Clazz.prepareFields (c$, function () {
this.nodes =  new JU.BS ();
});
Clazz.makeConstructor (c$, 
function (a, b) {
this.idx = a;
this.id = b;
}, "~N,~S");
c$ = Clazz.p0p ();
};
c$.$TopoCifParser$TopoPrimitive$ = function () {
Clazz.pu$h(self.c$);
c$ = Clazz.decorateAsClass (function () {
Clazz.prepareCallback (this, arguments);
this.p1u = null;
this.p2u = null;
this.v12f = null;
this.isValid = false;
this.symop = 0;
Clazz.instantialize (this, arguments);
}, J.adapter.readers.cif.TopoCifParser, "TopoPrimitive");
Clazz.makeConstructor (c$, 
function (a, b, c, d) {
this.symop = b;
var e =  new JU.P3 ();
var f =  new JU.P3 ();
e.setT (a.p1f);
f.setT (a.p2f);
d.rotTrans (e);
d.rotTrans (f);
this.p1u = JU.P3.newP (e);
c.unitize (this.p1u);
this.p2u = JU.P3.newP (f);
this.p2u.add (JU.V3.newVsub (this.p1u, e));
this.v12f = JU.V3.newVsub (this.p2u, this.p1u);
e.setT (this.p1u);
f.setT (this.p2u);
c.toCartesian (e, true);
c.toCartesian (f, true);
if (Float.isNaN (a.d) || a.d == 0) {
System.out.println ("TopoCifParser link distance " + a.p1f + "-" + a.p2f + " assigned " + e.distance (f) + " given as " + a.d);
a.d = e.distance (f);
this.isValid = true;
} else {
this.isValid = J.adapter.readers.cif.TopoCifParser.isEqualD (e, f, a.d);
}if (!this.isValid) {
var g = "TopoCifParser link ignored due to distance error " + a.p1f + "-" + a.p2f + " actual " + e.distance (f) + " expected " + a.d + " for operator " + b + "\n";
this.b$["J.adapter.readers.cif.TopoCifParser"].reader.appendLoadNote (g);
}}, "J.adapter.readers.cif.TopoCifParser.Link,~N,J.api.SymmetryInterface,JU.M4");
Clazz.defineMethod (c$, "info", 
function () {
return "op=" + this.symop + " pt=" + this.p1u + " v=" + this.v12f;
});
Clazz.overrideMethod (c$, "toString", 
function () {
return this.info ();
});
c$ = Clazz.p0p ();
};
Clazz.defineStatics (c$,
"ERROR_TOLERANCE", 0.001,
"topolFields",  Clazz.newArray (-1, ["_topol_link_node_label_1", "_topol_link_node_label_2", "_topol_link_distance", "_topol_link_site_symmetry_symop_1", "_topol_link_site_symmetry_translation_1_x", "_topol_link_site_symmetry_translation_1_y", "_topol_link_site_symmetry_translation_1_z", "_topol_link_site_symmetry_symop_2", "_topol_link_site_symmetry_translation_2_x", "_topol_link_site_symmetry_translation_2_y", "_topol_link_site_symmetry_translation_2_z", "_topol_link_type", "_topol_link_multiplicity", "_topol_link_voronoi_solidangle", "_topol_link_site_symmetry_translation_1", "_topol_link_site_symmetry_translation_2", "_topol_link_order", "_topol_node_atom_label", "_topol_node_label", "_topol_node_fract_x", "_topol_node_fract_y", "_topol_node_fract_z", "_topol_node_net_id", "_topol_node_chemical_formula_sum", "_topol_net_id"]),
"topol_link_node_label_1", 0,
"topol_link_node_label_2", 1,
"topol_link_distance", 2,
"topol_link_site_symmetry_symop_1", 3,
"topol_link_site_symmetry_translation_1_x", 4,
"topol_link_site_symmetry_translation_1_y", 5,
"topol_link_site_symmetry_translation_1_z", 6,
"topol_link_site_symmetry_symop_2", 7,
"topol_link_site_symmetry_translation_2_x", 8,
"topol_link_site_symmetry_translation_2_y", 9,
"topol_link_site_symmetry_translation_2_z", 10,
"topol_link_type", 11,
"topol_link_multiplicity", 12,
"topol_link_voronoi_solidangle", 13,
"topol_link_site_symmetry_translation_1", 14,
"topol_link_site_symmetry_translation_2", 15,
"topol_link_order", 16,
"topol_node_atom_label", 17,
"topol_node_label", 18,
"topol_node_fract_x", 19,
"topol_node_fract_y", 20,
"topol_node_fract_z", 21,
"topol_node_net_id", 22,
"topol_node_chemical_formula_sum", 23,
"topol_net_id", 24);
});
