import 'package:dev/views/people_view/people_view_state.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';

class PeopleViewSearchBar extends StatefulWidget {
  const PeopleViewSearchBar({Key? key}) : super(key: key);

  @override
  PeopleViewSearchBarState createState() => PeopleViewSearchBarState();
}

class PeopleViewSearchBarState extends State<PeopleViewSearchBar> {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: MediaQuery.of(context).size.width,
      color: Colors.white,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    decoration: BoxDecoration(
                      color: Colors.grey[200],
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.search),
                        const SizedBox(width: 5),
                        Expanded(
                          child: SizedBox(
                            height: 50,
                            child: Stack(
                              children: [
                                Positioned.fill(
                                  child: Center(
                                    child: TextField(
                                      enableSuggestions: false,
                                      controller: peopleViewState.peopleSearchTextController,
                                      textInputAction: TextInputAction.go,
                                      decoration: const InputDecoration(
                                        hintText: 'Search people',
                                        border: InputBorder.none,
                                        contentPadding: EdgeInsets.zero,
                                      ),
                                      onSubmitted: (value) => peopleViewState.searchPeople(),
                                    ),
                                  ),
                                ),
                                // // cirlce progress
                                // if (peopleViewState.searchingPeople)
                                //   const Positioned(
                                //     right: 0,
                                //     height: 50,
                                //     child: Center(
                                //       child: SizedBox(height: 25, width: 25, child: CircularProgressIndicator()),
                                //     ),
                                //   ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
