// This file has been generated by the reflectable package.
// https://github.com/dart-lang/reflectable.

import 'dart:core';
import 'package:dev/models/CurrentImageData.dart' as prefix1;
import 'package:dev/models/Prompt.dart' as prefix2;
import 'package:dev/models/Serializable.dart' as prefix0;

// ignore_for_file: camel_case_types
// ignore_for_file: implementation_imports
// ignore_for_file: prefer_adjacent_string_concatenation
// ignore_for_file: prefer_collection_literals
// ignore_for_file: unnecessary_const

// ignore:unused_import
import 'package:reflectable/mirrors.dart' as m;
// ignore:unused_import
import 'package:reflectable/src/reflectable_builder_based.dart' as r;
// ignore:unused_import
import 'package:reflectable/reflectable.dart' as r show Reflectable;

final _data = <r.Reflectable, r.ReflectorData>{
  const prefix0.Reflector(): r.ReflectorData(
      <m.TypeMirror>[
        r.NonGenericClassMirrorImpl(
            r'CurrentImageData',
            r'.CurrentImageData',
            134217735,
            0,
            const prefix0.Reflector(),
            const <int>[0, 1, 2, 3, 4, 5, 6, 7, 22, 23],
            const <int>[
              40,
              41,
              42,
              43,
              44,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39
            ],
            const <int>[],
            -1,
            {},
            {},
            {},
            -1,
            -1,
            const <int>[-1],
            null,
            null),
        r.NonGenericClassMirrorImpl(
            r'Serializable',
            r'.Serializable',
            134217735,
            1,
            const prefix0.Reflector(),
            const <int>[45, 46],
            const <int>[40, 41, 42, 43, 44, 45, 46],
            const <int>[],
            -1,
            {},
            {},
            {},
            -1,
            -1,
            const <int>[-1],
            null,
            null),
        r.NonGenericClassMirrorImpl(
            r'Prompt',
            r'.Prompt',
            134217735,
            2,
            const prefix0.Reflector(),
            const <int>[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
            const <int>[
              40,
              41,
              42,
              43,
              44,
              45,
              46,
              47,
              48,
              49,
              50,
              51,
              52,
              53,
              54,
              55,
              56,
              57,
              58,
              59,
              60,
              61,
              62,
              63,
              64,
              65,
              66,
              67,
              68,
              69,
              70,
              71,
              72,
              73,
              74
            ],
            const <int>[],
            -1,
            {},
            {},
            {},
            -1,
            -1,
            const <int>[-1],
            null,
            null)
      ],
      <m.DeclarationMirror>[
        r.VariableMirrorImpl(r'name', 134348805, 0, const prefix0.Reflector(),
            -1, -1, -1, null, null),
        r.VariableMirrorImpl(r'prompt', 134348805, 0, const prefix0.Reflector(),
            -1, -1, -1, null, null),
        r.VariableMirrorImpl(r'style', 134348805, 0, const prefix0.Reflector(),
            -1, -1, -1, null, null),
        r.VariableMirrorImpl(r'mostRecentShare', 67239941, 0,
            const prefix0.Reflector(), -1, -1, -1, null, null),
        r.VariableMirrorImpl(r'liked', 134348805, 0, const prefix0.Reflector(),
            -1, -1, -1, null, null),
        r.VariableMirrorImpl(r'promptId', 67239941, 0,
            const prefix0.Reflector(), -1, -1, -1, null, null),
        r.VariableMirrorImpl(r'isOwnPrompt', 134348805, 0,
            const prefix0.Reflector(), -1, -1, -1, null, null),
        r.VariableMirrorImpl(r'model', 67239941, 0, const prefix0.Reflector(),
            -1, -1, -1, null, null),
        r.VariableMirrorImpl(r'id', 67239941, 2, const prefix0.Reflector(), -1,
            -1, -1, null, null),
        r.VariableMirrorImpl(r'created', 67239941, 2, const prefix0.Reflector(),
            -1, -1, -1, null, null),
        r.VariableMirrorImpl(r'updated', 67239941, 2, const prefix0.Reflector(),
            -1, -1, -1, null, null),
        r.VariableMirrorImpl(r'createdBy', 67239941, 2,
            const prefix0.Reflector(), -1, -1, -1, null, null),
        r.VariableMirrorImpl(r'updatedBy', 67239941, 2,
            const prefix0.Reflector(), -1, -1, -1, null, null),
        r.VariableMirrorImpl(r'promptCategory', 67239941, 2,
            const prefix0.Reflector(), -1, -1, -1, null, null),
        r.VariableMirrorImpl(r'text', 134348805, 2, const prefix0.Reflector(),
            -1, -1, -1, null, null),
        r.VariableMirrorImpl(r'title', 134348805, 2, const prefix0.Reflector(),
            -1, -1, -1, null, null),
        r.VariableMirrorImpl(r'style', 134348805, 2, const prefix0.Reflector(),
            -1, -1, -1, null, null),
        r.VariableMirrorImpl(r'authenticatedUser', 67239941, 2,
            const prefix0.Reflector(), -1, -1, -1, null, null),
        r.VariableMirrorImpl(r'likesCount', 67239941, 2,
            const prefix0.Reflector(), -1, -1, -1, null, null),
        r.VariableMirrorImpl(r'uploadUrl', 67239941, 2,
            const prefix0.Reflector(), -1, -1, -1, null, null),
        r.VariableMirrorImpl(r'uploaded', 67239941, 2,
            const prefix0.Reflector(), -1, -1, -1, null, null),
        r.VariableMirrorImpl(r'sharedImage', 67239941, 2,
            const prefix0.Reflector(), -1, -1, -1, null, null),
        r.MethodMirrorImpl(r'save', 524290, 0, -1, -1, -1, null, const <int>[],
            const prefix0.Reflector(), null),
        r.MethodMirrorImpl(r'delete', 524290, 0, -1, -1, -1, null,
            const <int>[], const prefix0.Reflector(), null),
        r.ImplicitGetterMirrorImpl(const prefix0.Reflector(), 0, 24),
        r.ImplicitSetterMirrorImpl(const prefix0.Reflector(), 0, 25),
        r.ImplicitGetterMirrorImpl(const prefix0.Reflector(), 1, 26),
        r.ImplicitSetterMirrorImpl(const prefix0.Reflector(), 1, 27),
        r.ImplicitGetterMirrorImpl(const prefix0.Reflector(), 2, 28),
        r.ImplicitSetterMirrorImpl(const prefix0.Reflector(), 2, 29),
        r.ImplicitGetterMirrorImpl(const prefix0.Reflector(), 3, 30),
        r.ImplicitSetterMirrorImpl(const prefix0.Reflector(), 3, 31),
        r.ImplicitGetterMirrorImpl(const prefix0.Reflector(), 4, 32),
        r.ImplicitSetterMirrorImpl(const prefix0.Reflector(), 4, 33),
        r.ImplicitGetterMirrorImpl(const prefix0.Reflector(), 5, 34),
        r.ImplicitSetterMirrorImpl(const prefix0.Reflector(), 5, 35),
        r.ImplicitGetterMirrorImpl(const prefix0.Reflector(), 6, 36),
        r.ImplicitSetterMirrorImpl(const prefix0.Reflector(), 6, 37),
        r.ImplicitGetterMirrorImpl(const prefix0.Reflector(), 7, 38),
        r.ImplicitSetterMirrorImpl(const prefix0.Reflector(), 7, 39),
        r.MethodMirrorImpl(r'==', 2097154, -1, -1, -1, -1, null, const <int>[8],
            const prefix0.Reflector(), null),
        r.MethodMirrorImpl(r'toString', 2097154, -1, -1, -1, -1, null,
            const <int>[], const prefix0.Reflector(), null),
        r.MethodMirrorImpl(r'noSuchMethod', 524290, -1, -1, -1, -1, null,
            const <int>[9], const prefix0.Reflector(), null),
        r.MethodMirrorImpl(r'hashCode', 2097155, -1, -1, -1, -1, null,
            const <int>[], const prefix0.Reflector(), null),
        r.MethodMirrorImpl(r'runtimeType', 2097155, -1, -1, -1, -1, null,
            const <int>[], const prefix0.Reflector(), null),
        r.MethodMirrorImpl(r'toMap', 35651586, 1, -1, -1, -1, null,
            const <int>[], const prefix0.Reflector(), null),
        r.MethodMirrorImpl(r'fromMap', 1310722, 1, -1, -1, -1, null,
            const <int>[10], const prefix0.Reflector(), null),
        r.ImplicitGetterMirrorImpl(const prefix0.Reflector(), 8, 47),
        r.ImplicitSetterMirrorImpl(const prefix0.Reflector(), 8, 48),
        r.ImplicitGetterMirrorImpl(const prefix0.Reflector(), 9, 49),
        r.ImplicitSetterMirrorImpl(const prefix0.Reflector(), 9, 50),
        r.ImplicitGetterMirrorImpl(const prefix0.Reflector(), 10, 51),
        r.ImplicitSetterMirrorImpl(const prefix0.Reflector(), 10, 52),
        r.ImplicitGetterMirrorImpl(const prefix0.Reflector(), 11, 53),
        r.ImplicitSetterMirrorImpl(const prefix0.Reflector(), 11, 54),
        r.ImplicitGetterMirrorImpl(const prefix0.Reflector(), 12, 55),
        r.ImplicitSetterMirrorImpl(const prefix0.Reflector(), 12, 56),
        r.ImplicitGetterMirrorImpl(const prefix0.Reflector(), 13, 57),
        r.ImplicitSetterMirrorImpl(const prefix0.Reflector(), 13, 58),
        r.ImplicitGetterMirrorImpl(const prefix0.Reflector(), 14, 59),
        r.ImplicitSetterMirrorImpl(const prefix0.Reflector(), 14, 60),
        r.ImplicitGetterMirrorImpl(const prefix0.Reflector(), 15, 61),
        r.ImplicitSetterMirrorImpl(const prefix0.Reflector(), 15, 62),
        r.ImplicitGetterMirrorImpl(const prefix0.Reflector(), 16, 63),
        r.ImplicitSetterMirrorImpl(const prefix0.Reflector(), 16, 64),
        r.ImplicitGetterMirrorImpl(const prefix0.Reflector(), 17, 65),
        r.ImplicitSetterMirrorImpl(const prefix0.Reflector(), 17, 66),
        r.ImplicitGetterMirrorImpl(const prefix0.Reflector(), 18, 67),
        r.ImplicitSetterMirrorImpl(const prefix0.Reflector(), 18, 68),
        r.ImplicitGetterMirrorImpl(const prefix0.Reflector(), 19, 69),
        r.ImplicitSetterMirrorImpl(const prefix0.Reflector(), 19, 70),
        r.ImplicitGetterMirrorImpl(const prefix0.Reflector(), 20, 71),
        r.ImplicitSetterMirrorImpl(const prefix0.Reflector(), 20, 72),
        r.ImplicitGetterMirrorImpl(const prefix0.Reflector(), 21, 73),
        r.ImplicitSetterMirrorImpl(const prefix0.Reflector(), 21, 74)
      ],
      <m.ParameterMirror>[
        r.ParameterMirrorImpl(r'_name', 134348902, 25,
            const prefix0.Reflector(), -1, -1, -1, null, null, null, null),
        r.ParameterMirrorImpl(r'_prompt', 134348902, 27,
            const prefix0.Reflector(), -1, -1, -1, null, null, null, null),
        r.ParameterMirrorImpl(r'_style', 134348902, 29,
            const prefix0.Reflector(), -1, -1, -1, null, null, null, null),
        r.ParameterMirrorImpl(r'_mostRecentShare', 67240038, 31,
            const prefix0.Reflector(), -1, -1, -1, null, null, null, null),
        r.ParameterMirrorImpl(r'_liked', 134348902, 33,
            const prefix0.Reflector(), -1, -1, -1, null, null, null, null),
        r.ParameterMirrorImpl(r'_promptId', 67240038, 35,
            const prefix0.Reflector(), -1, -1, -1, null, null, null, null),
        r.ParameterMirrorImpl(r'_isOwnPrompt', 134348902, 37,
            const prefix0.Reflector(), -1, -1, -1, null, null, null, null),
        r.ParameterMirrorImpl(r'_model', 67240038, 39,
            const prefix0.Reflector(), -1, -1, -1, null, null, null, null),
        r.ParameterMirrorImpl(r'other', 134348806, 40,
            const prefix0.Reflector(), -1, -1, -1, null, null, null, null),
        r.ParameterMirrorImpl(r'invocation', 134348806, 42,
            const prefix0.Reflector(), -1, -1, -1, null, null, null, null),
        r.ParameterMirrorImpl(r'map', 151126022, 46, const prefix0.Reflector(),
            -1, -1, -1, null, null, null, null),
        r.ParameterMirrorImpl(r'_id', 67240038, 48, const prefix0.Reflector(),
            -1, -1, -1, null, null, null, null),
        r.ParameterMirrorImpl(r'_created', 67240038, 50,
            const prefix0.Reflector(), -1, -1, -1, null, null, null, null),
        r.ParameterMirrorImpl(r'_updated', 67240038, 52,
            const prefix0.Reflector(), -1, -1, -1, null, null, null, null),
        r.ParameterMirrorImpl(r'_createdBy', 67240038, 54,
            const prefix0.Reflector(), -1, -1, -1, null, null, null, null),
        r.ParameterMirrorImpl(r'_updatedBy', 67240038, 56,
            const prefix0.Reflector(), -1, -1, -1, null, null, null, null),
        r.ParameterMirrorImpl(r'_promptCategory', 67240038, 58,
            const prefix0.Reflector(), -1, -1, -1, null, null, null, null),
        r.ParameterMirrorImpl(r'_text', 134348902, 60,
            const prefix0.Reflector(), -1, -1, -1, null, null, null, null),
        r.ParameterMirrorImpl(r'_title', 134348902, 62,
            const prefix0.Reflector(), -1, -1, -1, null, null, null, null),
        r.ParameterMirrorImpl(r'_style', 134348902, 64,
            const prefix0.Reflector(), -1, -1, -1, null, null, null, null),
        r.ParameterMirrorImpl(r'_authenticatedUser', 67240038, 66,
            const prefix0.Reflector(), -1, -1, -1, null, null, null, null),
        r.ParameterMirrorImpl(r'_likesCount', 67240038, 68,
            const prefix0.Reflector(), -1, -1, -1, null, null, null, null),
        r.ParameterMirrorImpl(r'_uploadUrl', 67240038, 70,
            const prefix0.Reflector(), -1, -1, -1, null, null, null, null),
        r.ParameterMirrorImpl(r'_uploaded', 67240038, 72,
            const prefix0.Reflector(), -1, -1, -1, null, null, null, null),
        r.ParameterMirrorImpl(r'_sharedImage', 67240038, 74,
            const prefix0.Reflector(), -1, -1, -1, null, null, null, null)
      ],
      <Type>[prefix1.CurrentImageData, prefix0.Serializable, prefix2.Prompt],
      3,
      {
        r'==': (dynamic instance) => (x) => instance == x,
        r'toString': (dynamic instance) => instance.toString,
        r'noSuchMethod': (dynamic instance) => instance.noSuchMethod,
        r'hashCode': (dynamic instance) => instance.hashCode,
        r'runtimeType': (dynamic instance) => instance.runtimeType,
        r'save': (dynamic instance) => instance.save,
        r'delete': (dynamic instance) => instance.delete,
        r'name': (dynamic instance) => instance.name,
        r'prompt': (dynamic instance) => instance.prompt,
        r'style': (dynamic instance) => instance.style,
        r'mostRecentShare': (dynamic instance) => instance.mostRecentShare,
        r'liked': (dynamic instance) => instance.liked,
        r'promptId': (dynamic instance) => instance.promptId,
        r'isOwnPrompt': (dynamic instance) => instance.isOwnPrompt,
        r'model': (dynamic instance) => instance.model,
        r'toMap': (dynamic instance) => instance.toMap,
        r'fromMap': (dynamic instance) => instance.fromMap,
        r'id': (dynamic instance) => instance.id,
        r'created': (dynamic instance) => instance.created,
        r'updated': (dynamic instance) => instance.updated,
        r'createdBy': (dynamic instance) => instance.createdBy,
        r'updatedBy': (dynamic instance) => instance.updatedBy,
        r'promptCategory': (dynamic instance) => instance.promptCategory,
        r'text': (dynamic instance) => instance.text,
        r'title': (dynamic instance) => instance.title,
        r'authenticatedUser': (dynamic instance) => instance.authenticatedUser,
        r'likesCount': (dynamic instance) => instance.likesCount,
        r'uploadUrl': (dynamic instance) => instance.uploadUrl,
        r'uploaded': (dynamic instance) => instance.uploaded,
        r'sharedImage': (dynamic instance) => instance.sharedImage
      },
      {
        r'name=': (dynamic instance, value) => instance.name = value,
        r'prompt=': (dynamic instance, value) => instance.prompt = value,
        r'style=': (dynamic instance, value) => instance.style = value,
        r'mostRecentShare=': (dynamic instance, value) =>
            instance.mostRecentShare = value,
        r'liked=': (dynamic instance, value) => instance.liked = value,
        r'promptId=': (dynamic instance, value) => instance.promptId = value,
        r'isOwnPrompt=': (dynamic instance, value) =>
            instance.isOwnPrompt = value,
        r'model=': (dynamic instance, value) => instance.model = value,
        r'id=': (dynamic instance, value) => instance.id = value,
        r'created=': (dynamic instance, value) => instance.created = value,
        r'updated=': (dynamic instance, value) => instance.updated = value,
        r'createdBy=': (dynamic instance, value) => instance.createdBy = value,
        r'updatedBy=': (dynamic instance, value) => instance.updatedBy = value,
        r'promptCategory=': (dynamic instance, value) =>
            instance.promptCategory = value,
        r'text=': (dynamic instance, value) => instance.text = value,
        r'title=': (dynamic instance, value) => instance.title = value,
        r'authenticatedUser=': (dynamic instance, value) =>
            instance.authenticatedUser = value,
        r'likesCount=': (dynamic instance, value) =>
            instance.likesCount = value,
        r'uploadUrl=': (dynamic instance, value) => instance.uploadUrl = value,
        r'uploaded=': (dynamic instance, value) => instance.uploaded = value,
        r'sharedImage=': (dynamic instance, value) =>
            instance.sharedImage = value
      },
      null,
      [])
};

final _memberSymbolMap = null;

void initializeReflectable() {
  r.data = _data;
  r.memberSymbolMap = _memberSymbolMap;
}
