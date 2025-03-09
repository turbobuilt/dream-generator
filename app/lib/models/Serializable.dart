import 'package:reflectable/reflectable.dart';


class Reflector extends Reflectable {
  const Reflector()
      : super(
          // invokingCapability,
          instanceInvokeCapability,
          // reflectedTypeCapability,
          // typeRelationsCapability,
          typeCapability,
          declarationsCapability,
          
          // metadataCapability,
          // newInstanceCapability,
        );
}

const reflector = Reflector();

@reflector
class Serializable {
  Map<String, dynamic> toMap() {
    final mirror = reflector.reflect(this);
    final map = <String, dynamic>{};
    mirror.type.declarations.forEach((key, value) {
      if (value is VariableMirror) {
        map[key] = mirror.invokeGetter(key);
      }
    });
    return map;
  }

  void fromMap(Map<String, dynamic> map) {
    final mirror = reflector.reflect(this);
    map.forEach((key, value) {
      mirror.invokeSetter(key, value);
    });
  }

  
}