import 'package:dev/helpers/router.dart';
import 'package:dev/lib/smart_widget.dart';
import 'package:dev/views/people_view/components/search_bar.dart';
import 'package:dev/views/people_view/people_view_state.dart';
import 'package:flutter/material.dart';
import 'package:flutter_avif/flutter_avif.dart';

class PeopleView extends SmartWidget {
  PeopleView() {
    state = peopleViewState;
  }

  @override
  Widget render(BuildContext context) {
    return Container(
      width: MediaQuery.of(context).size.width,
      color: Colors.white,
      child: Column(children: [
        const PeopleViewSearchBar(),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(0),
            itemCount: peopleViewState.peopleResults.length,
            itemBuilder: (context, index) {
              print(peopleViewState.peopleResults[index]);
              var result = peopleViewState.peopleResults[index];
              return Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: InkWell(
                  onTap: () {
                    router.pushNamed("userPublicProfile", pathParameters: {"userName": peopleViewState.peopleResults[index]['userName']});
                  },
                  child: ListTile(
                    title: Text(result['userName']),
                    leading: result['pictureGuid'] != null
                        ? ClipRRect(
                            // circle avatar
                            borderRadius: BorderRadius.circular(50),
                            child: AvifImage.network("https://images.dreamgenerator.ai/profile-pictures/${result['pictureGuid']}"),
                          )
                        : const Icon(Icons.person),
                  ),
                ),
              );
            },
          ),
        ),
      ]),
    );
  }
}
