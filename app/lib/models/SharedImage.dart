


import 'Serializable.dart';

@reflector
class SharedImage extends Serializable {
  int? id;
  int? created;
  int? updated;
  int? createdBy;
  int? updatedBy;
  String? key;
  var uploaded = false;
}
